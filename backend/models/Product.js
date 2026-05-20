import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  
  // OLD - keep for backward compatibility
  image: { type: String },
  
  // NEW - multiple images support
  images: [{ type: String }],  // Array of image URLs
  mainImage: { type: String },  // Primary/thumbnail image
  
  // Additional product details
  brand: { type: String },
  model: { type: String },
  specifications: { type: mongoose.Schema.Types.Mixed },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)