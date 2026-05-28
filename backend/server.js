import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

const app = express()

// ✅ FIXED CORS - Allow all necessary headers
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-User-ID',
    'Cache-Control',
    'Pragma',
    'Expires'
  ]
}))

// ✅ Disable caching for all API routes
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

app.use(express.json({ limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!', timestamp: Date.now() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ message: err.message })
})

// MongoDB connection - FIXED: Changed MONGO_URI to MONGODB_URI
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`📍 Frontend URL: http://localhost:3000`)
      console.log(`📍 Health check: http://localhost:5000/api/health`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })