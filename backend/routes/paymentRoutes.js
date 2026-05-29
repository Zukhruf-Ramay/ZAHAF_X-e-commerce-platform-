  import express from 'express';
  import Stripe from 'stripe';
  import Order from '../models/Order.js';
  import Cart from '../models/Cart.js';
  import { protect } from '../middleware/authMiddleware.js';
  import config from '../config/index.js';

  const router = express.Router();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
        success_url: `${config.frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontendUrl}/payment-cancel`,
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

  export default router;