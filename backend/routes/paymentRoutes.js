import express from 'express'
import Stripe from 'stripe'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create checkout session - PKR support with GST included
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { orderId } = req.body
    const userId = req.user._id
    
    const order = await Order.findById(orderId).populate('items.product')
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'pkr',
        product_data: { 
          name: item.product?.name || 'Product',
          description: `Quantity: ${item.quantity} (includes 18% GST)`,
        },
        unit_amount: Math.round((item.price || 0) * 1.18 * 100),
      },
      quantity: item.quantity,
    }))
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
      metadata: { 
        orderId: order._id.toString(), 
        userId: userId.toString(),
      },
    })
    
    await Order.findByIdAndUpdate(orderId, { 
      stripeSessionId: session.id,
      paymentStatus: 'pending'
    })
    
    console.log(`✅ Stripe session created for order ${orderId} in PKR (GST included)`)
    res.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Get order by Stripe session ID
router.get('/order-by-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    
    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate('items.product')
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found for this session' })
    }
    
    res.json(order)
  } catch (error) {
    console.error('Error fetching order by session:', error)
    res.status(500).json({ error: error.message })
  }
})

// Manual payment success endpoint
router.post('/payment-success', async (req, res) => {
  try {
    const { sessionId, orderId, paymentDetails } = req.body
    
    let order = null
    
    if (sessionId) {
      order = await Order.findOne({ stripeSessionId: sessionId })
    } else if (orderId) {
      order = await Order.findById(orderId)
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    order.paymentStatus = 'paid'
    order.status = 'processing'
    order.paymentMethod = 'card'
    order.paidAt = new Date()
    
    if (paymentDetails) {
      order.paymentDetails = {
        cardLast4: paymentDetails.cardLast4 || 'N/A',
        cardBrand: paymentDetails.cardBrand || 'N/A',
        receiptUrl: paymentDetails.receiptUrl || null
      }
      if (paymentDetails.transactionId) {
        order.transactionId = paymentDetails.transactionId
      }
    }
    
    await order.save()
    
    if (order.user) {
      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [] },
        { new: true }
      )
      console.log(`✅ Cart cleared for user ${order.user} after payment`)
    }
    
    console.log(`✅ Payment successful for order ${order._id}`)
    
    res.json({ success: true, message: 'Payment successful, cart cleared', order })
  } catch (error) {
    console.error('Payment success error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Webhook - No authentication needed (Stripe calls this)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  
  console.log('📡 Webhook received')
  
  try {
    const rawBody = req.rawBody || req.body
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
    console.log('✅ Event type:', event.type)
  } catch (err) {
    console.error('❌ Webhook error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  
  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata.orderId
    const userId = session.metadata.userId
    
    console.log(`💰 Payment completed for order: ${orderId}`)
    
    let paymentDetails = {}
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
        const paymentMethod = paymentIntent.payment_method 
          ? await stripe.paymentMethods.retrieve(paymentIntent.payment_method)
          : null
        
        paymentDetails = {
          cardLast4: paymentMethod?.card?.last4 || 'N/A',
          cardBrand: paymentMethod?.card?.brand || 'N/A',
          receiptUrl: paymentIntent?.charges?.data[0]?.receipt_url || null
        }
      } catch (err) {
        console.error('Error fetching payment details:', err)
      }
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      status: 'processing',
      paymentMethod: 'card',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      transactionId: session.payment_intent,
      paidAt: new Date(),
      paymentDetails: paymentDetails
    }, { new: true })
    
    console.log(`✅ Order ${orderId} payment status updated to: ${updatedOrder.paymentStatus}`)
    
    if (userId) {
      await Cart.findOneAndUpdate(
        { user: userId },
        { items: [] },
        { new: true }
      )
      console.log(`✅ Cart cleared for user ${userId}`)
    }
  }
  
  // Handle payment failure
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object
    const orderId = paymentIntent.metadata?.orderId
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        status: 'pending',
        paymentFailureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      })
      console.log(`❌ Payment failed for order ${orderId}`)
    }
  }
  
  res.json({ received: true })
})

// Refund endpoint
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId, paymentIntentId, amount } = req.body
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' })
    }
    
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: Math.round(amount * 100),
    })
    
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'refunded',
      isRefunded: true,
      refundedAmount: amount,
      refundedAt: new Date(),
      'paymentDetails.refundId': refund.id
    })
    
    console.log(`✅ Refund processed for order ${orderId}, amount: ${amount}`)
    
    res.json({ success: true, message: 'Refund processed successfully', refund })
  } catch (error) {
    console.error('Refund error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Cleanup failed orders
router.post('/cleanup-failed-orders', protect, async (req, res) => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const result = await Order.updateMany(
      { 
        paymentStatus: 'failed', 
        createdAt: { $lt: cutoffDate },
        status: 'pending'
      },
      { 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: 'Auto-cancelled due to payment failure'
      }
    )
    
    console.log(`✅ Cleaned up ${result.modifiedCount} failed orders`)
    res.json({ success: true, cleanedCount: result.modifiedCount })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router