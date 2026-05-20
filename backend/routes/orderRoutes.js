import express from 'express'
import Order from '../models/Order.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

// ✅ UPDATED: Get ALL orders (Admin only) with status filter
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status } = req.query
    
    // Build filter object
    let filter = {}
    if (status && status !== 'all') {
      filter.status = status
    }
    
    const orders = await Order.find(filter)
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    
    res.json(orders)
  } catch (err) {
    console.error('Error fetching all orders:', err)
    res.status(500).json({ message: err.message })
  }
})

// Get user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    console.error('Error fetching user orders:', err)
    res.status(500).json({ message: err.message, orders: [] })
  }
})

// Get single order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    console.log('📦 Fetching order:', req.params.id)
    
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email')
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // Safe authorization check
    const orderUserId = order.user?._id || order.user
    
    if (orderUserId?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('❌ Unauthorized access to order')
      return res.status(403).json({ message: 'Not authorized to view this order' })
    }
    
    res.json(order)
  } catch (err) {
    console.error('❌ Error fetching order:', err)
    res.status(500).json({ message: err.message })
  }
})

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const orderData = { ...req.body, user: req.user._id }
    
    // ✅ If payment method is COD, keep payment status as pending
    if (orderData.paymentMethod === 'cod') {
      orderData.paymentStatus = 'pending'
    }
    
    const order = await Order.create(orderData)
    res.status(201).json(order)
  } catch (err) {
    console.error('Error creating order:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ Update order status (Admin only) - Enhanced with payment logic
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    const oldStatus = order.status
    const newStatus = req.body.status
    
    order.status = newStatus
    
    // ✅ If COD order is being marked as delivered, update payment status to paid
    if (order.paymentMethod === 'cod' && newStatus === 'delivered' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid'
      order.paidAt = new Date()
      console.log(`✅ COD order ${order._id} marked as delivered, payment status updated to paid`)
    }
    
    // ✅ If order is being cancelled, apply refund logic
    if (newStatus === 'cancelled' && !order.isRefunded) {
      order.isRefunded = true
      order.refundedAmount = order.totalAmount
      order.refundedAt = new Date()
      
      // If payment was already paid (card payment), mark as refunded
      if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded'
        console.log(`✅ Order ${order._id} cancelled, payment refunded: Rs. ${order.totalAmount}`)
      } else {
        console.log(`✅ Order ${order._id} cancelled, no refund needed (payment was ${order.paymentStatus})`)
      }
    }
    
    await order.save()
    
    res.json(order)
  } catch (err) {
    console.error('Error updating status:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ Cancel order (User)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id
    })
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    // ✅ Check if order can be cancelled
    if (order.status === 'shipped') {
      return res.status(400).json({ message: 'Order has been shipped and cannot be cancelled' })
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order has been delivered and cannot be cancelled' })
    }
    
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' })
    }
    
    // ✅ Only pending and processing orders can be cancelled
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })
    }
    
    order.status = 'cancelled'
    order.isRefunded = true
    order.refundedAmount = order.totalAmount
    order.refundedAt = new Date()
    
    // ✅ If payment was already paid (card payment), mark as refunded
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded'
    }
    
    await order.save()
    
    res.json({ 
      message: order.paymentStatus === 'refunded' 
        ? 'Order cancelled and amount refunded successfully' 
        : 'Order cancelled successfully', 
      order 
    })
  } catch (err) {
    console.error('Error cancelling order:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ NEW: Mark order as delivered (Admin only) - specifically for COD
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Order is already delivered' })
    }
    
    order.status = 'delivered'
    
    // ✅ For COD orders, mark payment as paid when delivered
    if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid'
      order.paidAt = new Date()
    }
    
    await order.save()
    
    res.json({ 
      message: 'Order marked as delivered', 
      order,
      paymentUpdated: order.paymentMethod === 'cod'
    })
  } catch (err) {
    console.error('Error marking order as delivered:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ NEW: Process refund for card payment (Admin only)
router.post('/:id/refund', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (order.paymentMethod !== 'card') {
      return res.status(400).json({ message: 'Refund only available for card payments' })
    }
    
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Order payment is not in paid status' })
    }
    
    if (order.isRefunded) {
      return res.status(400).json({ message: 'Order has already been refunded' })
    }
    
    order.paymentStatus = 'refunded'
    order.isRefunded = true
    order.refundedAmount = order.totalAmount
    order.refundedAt = new Date()
    
    await order.save()
    
    res.json({ 
      message: 'Refund processed successfully', 
      order,
      refundAmount: order.totalAmount
    })
  } catch (err) {
    console.error('Error processing refund:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router