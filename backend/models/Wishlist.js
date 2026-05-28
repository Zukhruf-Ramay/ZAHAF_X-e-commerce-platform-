import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Create index for faster queries
wishlistSchema.index({ user: 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;