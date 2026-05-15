import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user, isSignedIn } = useUser()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    street: '', city: '', zip: '', phone: '',
    email: user?.primaryEmailAddress?.emailAddress || ''
  })
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const subtotal = totalPrice
  const shipping = subtotal > 50000 ? 0 : 499
  const tax = subtotal * 0.18
  const grandTotal = subtotal + shipping + tax

  if (!isSignedIn) {
    return <div className="text-center py-20">Please login to checkout <Link to="/login" className="text-blue-500">Login</Link></div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Cart is Empty!</h2>
          <Link to="/products" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg">Browse Products →</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = await window.Clerk?.session?.getToken()
      const clerkId = user?.id
      
      // 1. Create order
      const orderData = {
        items: cartItems.map(item => ({ 
          product: item._id, 
          quantity: item.quantity, 
          price: item.price 
        })),
        totalAmount: grandTotal,
        shippingAddress: { 
          street: form.street, 
          city: form.city, 
          zip: form.zip 
        },
        paymentMethod: paymentMethod,
        phone: form.phone
      }
      
      await axios.post('http://localhost:5000/api/orders', orderData, { 
        headers: { 
          Authorization: `Bearer ${token}`, 
          'X-Clerk-ID': clerkId 
        } 
      })
      
      // 2. Clear cart from backend
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { 
          'X-Clerk-ID': clerkId 
        }
      })
      
      // 3. Clear cart from frontend context
      clearCart()
      
      toast.success('🎉 Order placed successfully! Your cart has been cleared.')
      navigate('/order-success')
    } catch (err) {
      console.error('Order error:', err)
      toast.error(err.response?.data?.message || 'Order failed! Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name</label>
                  <input type="text" value={user?.fullName || ''} disabled className="w-full border p-2 rounded bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="w-full border p-2 rounded"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Street Address</label>
                  <input type="text" placeholder="House number, street" value={form.street} onChange={e => setForm({...form, street: e.target.value})} required className="w-full border p-2 rounded"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">City</label>
                    <input type="text" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required className="w-full border p-2 rounded"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">ZIP Code</label>
                    <input type="text" placeholder="ZIP" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} required className="w-full border p-2 rounded"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone Number</label>
                  <input type="tel" placeholder="+92 123 4567890" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full border p-2 rounded"/>
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3"/>
                <div><span className="font-semibold">Cash on Delivery</span><p className="text-sm text-gray-500">Pay when you receive</p></div>
              </label>
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `Rs. ${shipping.toLocaleString()}`}</span></div>
                <div className="flex justify-between text-sm"><span>Tax (GST 18%)</span><span>Rs. {tax.toLocaleString()}</span></div>
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span><span className="text-blue-600">Rs. {grandTotal.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleSubmit} 
                disabled={loading || !form.street || !form.city || !form.zip || !form.phone} 
                className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-300"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout