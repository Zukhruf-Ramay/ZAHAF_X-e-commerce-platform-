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

// CORS - MUST be before routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID']
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Test route (for debugging)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!', timestamp: new Date() })
})

app.post('/api/test', (req, res) => {
  console.log('✅ Test route working!')
  console.log('Request body:', req.body)
  res.json({ message: 'Test route works!', received: req.body })
})

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

// Routes - auth routes first
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('========================================')
  console.error('🔥 ERROR CAUGHT BY MIDDLEWARE:')
  console.error('🔥 Status:', err.status || 500)
  console.error('🔥 Message:', err.message)
  console.error('🔥 Stack:', err.stack)
  console.error('🔥 URL:', req.url)
  console.error('🔥 Method:', req.method)
  console.error('========================================')
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`)
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.url}` 
  })
})

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    
    // Start server
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`)
      console.log(`📍 Frontend URL: http://localhost:5173`)
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
      console.log(`📍 Test route: http://localhost:${PORT}/api/test`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    console.error('Please check your MONGO_URI in .env file')
    process.exit(1)
  })

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔴 Shutting down gracefully...')
  await mongoose.disconnect()
  console.log('✅ MongoDB disconnected')
  process.exit(0)
})