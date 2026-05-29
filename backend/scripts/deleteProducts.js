import mongoose from 'mongoose'
import Product from './models/Product.js'
import dotenv from 'dotenv'

dotenv.config()

async function deleteProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')
    
    const result = await Product.deleteMany({})
    console.log(`🗑️ Deleted ${result.deletedCount} products successfully!`)
    
    process.exit()
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

deleteProducts()