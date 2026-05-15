import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { limiter, securityHeaders, corsOptions, sanitizeInput } from './middleware/security.js'

import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import clerkWebhook from './routes/clerkWebhook.js'

dotenv.config()

const app = express()

// Apply CORS FIRST - Important!
app.use(cors(corsOptions))

// Then other middleware
app.use(securityHeaders)
app.use(express.json({ limit: '10kb' }))
app.use(sanitizeInput)
app.use(limiter)

// Custom middleware to extract Clerk user ID
app.use(async (req, res, next) => {
  // Get Clerk ID from various possible headers
  const clerkId = req.headers['x-clerk-id'] || req.headers['X-Clerk-ID']
  
  if (clerkId) {
    req.clerkId = clerkId
    console.log('✅ Clerk ID received:', clerkId)
  } else {
    console.log('⚠️ No Clerk ID in headers')
  }
  
  next()
})

// Debug route to check CORS and headers
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'CORS is working!',
    headers: req.headers,
    clerkId: req.clerkId
  })
})

// Routes
app.use('/api/webhooks', clerkWebhook)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected ✅')
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} ✅`)
      console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    })
  })
  .catch((err) => console.log('MongoDB connection error:', err))