import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
  clerkId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  items: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  }]
}, { 
  timestamps: true 
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema)
export default Wishlist