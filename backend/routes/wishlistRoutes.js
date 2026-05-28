import express from 'express'
import mongoose from 'mongoose'
import Wishlist from '../models/Wishlist.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get wishlist
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id

    let wishlist = await Wishlist.findOne({ user: userId }).populate('items')

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        items: []
      })

      wishlist = await wishlist.populate('items')
    }

    res.json(wishlist)
  } catch (err) {
    console.error('Wishlist error:', err)
    res.status(500).json({ message: err.message, items: [] })
  }
})

// Add to wishlist
router.post('/add', protect, async (req, res) => {
  try {
    const userId = req.user._id
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({
        message: 'Product ID required'
      })
    }

    // Prevent invalid MongoDB ObjectId errors
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      })
    }

    let wishlist = await Wishlist.findOne({ user: userId })

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        items: []
      })
    }

    const isProductInWishlist = wishlist.items.some(
      id => id.toString() === productId
    )

    if (!isProductInWishlist) {
      wishlist.items.push(productId)

      await wishlist.save()

      // safer populate
      wishlist = await wishlist.populate('items')
    }

    res.json(wishlist)
  } catch (err) {
    console.error('Add to wishlist error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Remove from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const userId = req.user._id
    const productId = req.params.productId

    // Prevent invalid MongoDB ObjectId errors
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      })
    }

    const wishlist = await Wishlist.findOne({ user: userId })

    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        id => id.toString() !== productId
      )

      await wishlist.save()

      // safer populate
      await wishlist.populate('items')
    }

    res.json(wishlist || { items: [] })
  } catch (err) {
    console.error('Remove from wishlist error:', err)
    res.status(500).json({ message: err.message })
  }
})

// Clear entire wishlist
router.delete('/clear', protect, async (req, res) => {
  try {
    const userId = req.user._id

    const wishlist = await Wishlist.findOne({ user: userId })

    if (wishlist) {
      wishlist.items = []

      await wishlist.save()
    }

    res.json({
      message: 'Wishlist cleared successfully',
      items: []
    })
  } catch (err) {
    console.error('Clear wishlist error:', err)
    res.status(500).json({ message: err.message })
  }
})

export default router