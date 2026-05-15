import express from 'express'
import Wishlist from '../models/Wishlist.js'

const router = express.Router()

const getClerkId = (req) => {
  return req.headers['x-clerk-id'] || req.headers['X-Clerk-ID']
}

// Get wishlist
router.get('/', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    console.log('GET /wishlist - Clerk ID:', clerkId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required', items: [] })
    }
    
    let wishlist = await Wishlist.findOne({ clerkId }).populate('items')
    
    if (!wishlist) {
      wishlist = { clerkId, items: [] }
    }
    
    res.json(wishlist)
  } catch (err) {
    console.error('Wishlist error:', err)
    res.status(500).json({ message: err.message, items: [] })
  }
})

// Add to wishlist
router.post('/add', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    const { productId } = req.body
    
    console.log('POST /wishlist/add - Clerk ID:', clerkId, 'Product:', productId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    let wishlist = await Wishlist.findOne({ clerkId })
    
    if (!wishlist) {
      wishlist = new Wishlist({ clerkId, items: [] })
    }
    
    if (!wishlist.items.includes(productId)) {
      wishlist.items.push(productId)
      await wishlist.save()
      await wishlist.populate('items')
      console.log('Product added to wishlist')
    }
    
    res.json(wishlist)
  } catch (err) {
    console.error('Add to wishlist error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Remove from wishlist
router.delete('/remove/:productId', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    
    console.log('DELETE /wishlist/remove - Clerk ID:', clerkId, 'Product:', req.params.productId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    const wishlist = await Wishlist.findOne({ clerkId })
    if (wishlist) {
      wishlist.items = wishlist.items.filter(id => id.toString() !== req.params.productId)
      await wishlist.save()
      await wishlist.populate('items')
    }
    
    res.json(wishlist || { items: [] })
  } catch (err) {
    console.error('Remove from wishlist error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ NEW: Clear entire wishlist
router.delete('/clear', async (req, res) => {
  try {
    const clerkId = getClerkId(req)
    console.log('DELETE /wishlist/clear - Clerk ID:', clerkId)
    
    if (!clerkId) {
      return res.status(401).json({ message: 'User ID required' })
    }
    
    const wishlist = await Wishlist.findOne({ clerkId })
    
    if (wishlist) {
      wishlist.items = []
      await wishlist.save()
      console.log('Wishlist cleared successfully for user:', clerkId)
    } else {
      console.log('No wishlist found for user:', clerkId)
    }
    
    res.json({ message: 'Wishlist cleared successfully', items: [] })
  } catch (err) {
    console.error('Clear wishlist error:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router