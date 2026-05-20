import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true })

// ✅ SIMPLE VERSION - Using async/await properly
userSchema.pre('save', async function() {
  try {
    console.log('🔐 Pre-save hook called for:', this.email)
    console.log('Password modified?', this.isModified('password'))
    
    if (!this.isModified('password')) {
      console.log('Password not modified, skipping hash')
      return
    }
    
    console.log('Original password:', this.password)
    
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    
    console.log('✅ Password hashed successfully!')
    console.log('New hash:', hashedPassword)
    this.password = hashedPassword
    
  } catch (error) {
    console.error('Hashing error:', error)
    // If an error occurs, throw it. Mongoose will catch it and pass it to the callback.
    throw error
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User