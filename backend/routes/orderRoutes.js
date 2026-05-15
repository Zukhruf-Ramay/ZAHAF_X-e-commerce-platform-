import express from 'express'
import Order from '../models/Order.js'

const router = express.Router()

const getClerkId = (req) => {
  return req.headers['x-clerk-id'] || req.headers['X-Clerk-ID']
}

// Get ALL orders (Admin only - no clerkId filter)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    console.error('Error fetching all orders:', err)
    res.status(500).json({ message: err.message })
  }
})

// Get user's orders
router.get('/myorders', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required', orders: [] })
    }
    
    const orders = await Order.find({ clerkId }).populate('items.product')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message, orders: [] })
  }
})

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create order
router.post('/', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    const order = await Order.create({ ...req.body, clerkId })
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update order status
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Cancel order
router.put('/:id/cancel', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    const order = await Order.findOne({ _id: req.params.id, clerkId })
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }
    
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ message: 'Order cannot be cancelled' })
    }
    
    order.status = 'cancelled'
    await order.save()
    res.json({ message: 'Order cancelled successfully', order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router