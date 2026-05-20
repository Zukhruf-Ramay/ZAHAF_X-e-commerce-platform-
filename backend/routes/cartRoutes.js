import express from 'express'
import Cart from '../models/Cart.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Get cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }
    
    res.json(cart)
  } catch (err) {
    console.error('Cart error:', err)
    res.status(500).json({ message: err.message, items: [] })
  }
})

// Add to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    const userId = req.user._id

    let cart = await Cart.findOne({ user: userId })
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }
    
    const existingItem = cart.items.find(item => item.product.toString() === productId)
    
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.items.push({ product: productId, quantity })
    }
    
    await cart.save()
    await cart.populate('items.product')
    
    res.json(cart)
  } catch (err) {
    console.error('Add to cart error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Update quantity
router.put('/update/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      const item = cart.items.find(item => item.product.toString() === req.params.productId)
      if (item) {
        item.quantity = quantity
        await cart.save()
        await cart.populate('items.product')
      }
    }
    
    res.json(cart || { items: [] })
  } catch (err) {
    console.error('Update error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Remove from cart
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId)
      await cart.save()
      await cart.populate('items.product')
    }
    
    res.json(cart || { items: [] })
  } catch (err) {
    console.error('Remove error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ NEW: Clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    
    if (cart) {
      cart.items = []
      await cart.save()
    }
    
    res.json({ message: 'Cart cleared successfully', items: [] })
  } catch (err) {
    console.error('Clear cart error:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router