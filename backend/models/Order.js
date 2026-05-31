import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
})

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  items: [orderItemSchema],
  
  // ✅ Price breakdown - Professional
  subtotal: { 
    type: Number, 
    required: true,
    default: 0 
  },
  gstAmount: { 
    type: Number, 
    required: true,
    default: 0 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  shippingAddress: {
    name: { type: String },
    street: { type: String },
    city: { type: String },
    zip: { type: String },
    phone: { type: String }
  },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'card', 'bank_transfer'],
    default: 'cod' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],  // ✅ Added 'cancelled'
    default: 'pending' 
  },
  paymentDetails: {
    transactionId: String,
    cardLast4: String,
    cardBrand: String,
    receiptUrl: String
  },
  stripePaymentIntentId: { type: String },
  stripeSessionId: { type: String },
  transactionId: { type: String },
  paidAt: { type: Date },
  
  // Refund tracking
  isRefunded: { type: Boolean, default: false },
  refundedAmount: { type: Number, default: 0 },
  refundedAt: { type: Date },
  
  phone: String,
  email: { type: String }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)
export default Order