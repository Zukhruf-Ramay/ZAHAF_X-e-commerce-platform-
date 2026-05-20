import mongoose from 'mongoose'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

async function testHook() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')
    
    // Delete existing test user
    await User.deleteOne({ email: 'test@hook.com' })
    console.log('Deleted existing test user')
    
    // Create new user
    console.log('\n📝 Creating new user...')
    const user = new User({
      name: 'Hook Test',
      email: 'test@hook.com',
      password: '123456'
    })
    
    await user.save()
    
    console.log('\n✅ User saved!')
    console.log('Final stored password:', user.password)
    console.log('Is it a hash?', user.password.startsWith('$2a$') ? 'YES ✅' : 'NO ❌')
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

testHook()