import express from 'express'
import Product from '../models/Product.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single product (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// CREATE product (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    console.log('✅ Product created:', product.name)
    res.status(201).json(product)
  } catch (err) {
    console.error('Create error:', err)
    res.status(500).json({ message: err.message })
  }
})

// UPDATE product (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    console.log('✅ Product updated:', product.name)
    res.json(product)
  } catch (err) {
    console.error('Update error:', err)
    res.status(500).json({ message: err.message })
  }
})

// DELETE product (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    console.log('✅ Product deleted:', product.name)
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: err.message })
  }
})

// ✅ CORRECT EXPORT
export default router