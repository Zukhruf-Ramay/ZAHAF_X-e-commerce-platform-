import express from 'express'
import Cart from '../models/Cart.js'

const router = express.Router()

// Helper to get clerkId
const getClerkId = (req) => {
  return req.headers['x-clerk-id'] || req.headers['X-Clerk-ID']
}

// Get cart
router.get('/', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    console.log('GET /cart - Clerk ID:', clerkId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required', items: [] })
    }
    
    let cart = await Cart.findOne({ clerkId }).populate('items.product')
    
    if (!cart) {
      cart = { clerkId, items: [] }
    }
    
    res.json(cart)
  } catch (err) {
    console.error('Cart error:', err)
    res.status(500).json({ message: err.message, items: [] })
  }
})

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    const { productId, quantity = 1 } = req.body
    
    console.log('POST /cart/add - Clerk ID:', clerkId, 'Product:', productId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    let cart = await Cart.findOne({ clerkId })
    
    if (!cart) {
      cart = new Cart({ clerkId, items: [] })
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
router.put('/update/:productId', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    const { quantity } = req.body
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    const cart = await Cart.findOne({ clerkId })
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
router.delete('/remove/:productId', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    const cart = await Cart.findOne({ clerkId })
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
router.delete('/clear', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    console.log('DELETE /cart/clear - Clerk ID:', clerkId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    const cart = await Cart.findOne({ clerkId })
    
    if (cart) {
      cart.items = []
      await cart.save()
      console.log('Cart cleared successfully for user:', clerkId)
    } else {
      console.log('No cart found for user:', clerkId)
    }
    
    res.json({ message: 'Cart cleared successfully', items: [] })
  } catch (err) {
    console.error('Clear cart error:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router