import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/authMiddleware.js';
import config from '../config/index.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;
    
    const order = await Order.findById(orderId).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
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
    }));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // ✅ FIXED: Redirect to backend verification first
      success_url: `${config.backendUrl}/api/payments/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.backendUrl}/api/payments/cancel?orderId=${orderId}`,
      metadata: { 
        orderId: order._id.toString(), 
        userId: userId.toString(),
      },
    });
    
    await Order.findByIdAndUpdate(orderId, { 
      stripeSessionId: session.id,
      paymentStatus: 'pending'
    });
    
    console.log(`✅ Stripe session created for order ${orderId}`);
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Verify payment and redirect to frontend
router.get('/verify', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.redirect(`${config.frontendUrl}/payment-cancel?reason=missing_session`);
    }
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      // Update order
      await Order.findByIdAndUpdate(session.metadata.orderId, {
        paymentStatus: 'completed',
        orderStatus: 'confirmed',
        stripePaymentIntentId: session.payment_intent
      });
      
      // Clear cart
      await Cart.findOneAndUpdate(
        { user: session.metadata.userId },
        { items: [], totalPrice: 0 }
      );
      
      console.log(`✅ Payment verified for order ${session.metadata.orderId}`);
      
      // ✅ Redirect to React frontend with order ID
      return res.redirect(`${config.frontendUrl}/payment-success?order=${session.metadata.orderId}`);
    } else {
      return res.redirect(`${config.frontendUrl}/payment-cancel?reason=payment_not_completed`);
    }
  } catch (error) {
    console.error('Verification error:', error.message);
    return res.redirect(`${config.frontendUrl}/payment-cancel?reason=verification_failed`);
  }
});

// Handle payment cancellation
router.get('/cancel', async (req, res) => {
  try {
    const { orderId } = req.query;
    
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'cancelled',
        orderStatus: 'cancelled'
      });
      console.log(`❌ Payment cancelled for order ${orderId}`);
    }
    
    return res.redirect(`${config.frontendUrl}/payment-cancel?orderId=${orderId || ''}`);
  } catch (error) {
    console.error('Cancel error:', error.message);
    return res.redirect(`${config.frontendUrl}/payment-cancel`);
  }
});

// ✅ API endpoint for React frontend to verify payment (returns JSON)
router.get('/verify-payment', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'Missing session_id' });
    }
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      const order = await Order.findById(session.metadata.orderId);
      return res.json({ 
        success: true, 
        order: order,
        paymentStatus: session.payment_status 
      });
    } else {
      return res.json({ 
        success: false, 
        paymentStatus: session.payment_status 
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stripe Webhook
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    await Order.findByIdAndUpdate(session.metadata.orderId, {
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      stripePaymentIntentId: session.payment_intent
    });
    
    await Cart.findOneAndUpdate(
      { user: session.metadata.userId },
      { items: [], totalPrice: 0 }
    );
    
    console.log(`✅ Webhook: Payment completed for order ${session.metadata.orderId}`);
  }
  
  res.json({ received: true });
});

export default router;