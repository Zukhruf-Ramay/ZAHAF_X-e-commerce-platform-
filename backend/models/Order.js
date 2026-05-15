import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
})

const orderSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, index: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  shippingAddress: {
    street: String,
    city: String,
    zip: String
  },
  paymentMethod: { type: String, default: 'cod' },
  phone: String
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)