import { useState, useRef, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import StripeCheckout from '../components/StripeCheckout'

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    street: '', city: '', zip: '', phone: '',
    email: user?.email || ''
  })
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [orderId, setOrderId] = useState(null)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [order, setOrder] = useState(null)
  
  const paymentInitiatedRef = useRef(false)

  // ✅ Professional Price Calculation
  const subtotal = totalPrice
  const GST_RATE = 0.18
  const gstAmount = subtotal * GST_RATE
  const grandTotal = subtotal + gstAmount

  // Check order status if orderId exists
  useEffect(() => {
    if (orderId && token) {
      checkOrderStatus()
    }
  }, [orderId, token])

  const checkOrderStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setOrder(res.data)
      setPaymentStatus(res.data.paymentStatus)
    } catch (err) {
      console.error('Error checking order status:', err)
    }
  }

  if (!user) {
    return <div className="text-center py-20">Please login to checkout <Link to="/login" className="text-blue-500">Login</Link></div>
  }

  if (cartItems.length === 0 && !orderId) {
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

  const createOrderData = () => ({
    items: cartItems.map(item => ({ 
      product: item._id, 
      quantity: item.quantity, 
      price: item.price 
    })),
    subtotal: subtotal,
    gstAmount: gstAmount,
    totalAmount: grandTotal,
    shippingAddress: { 
      street: form.street, 
      city: form.city, 
      zip: form.zip,
      name: user.name,
      phone: form.phone
    },
    phone: form.phone,
    email: form.email
  })

  const handleCardPayment = async () => {
    if (creatingOrder || orderId) return
    
    if (!form.street || !form.city || !form.zip || !form.phone) {
      toast.error('Please fill all shipping details')
      return
    }
    
    setCreatingOrder(true)
    try {
      const orderResponse = await axios.post('http://localhost:5000/api/orders', 
        { ...createOrderData(), paymentMethod: 'card', paymentStatus: 'pending' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setOrderId(orderResponse.data._id)
      toast.success('Order created! Proceed to payment...')
      
    } catch (err) {
      console.error('Order creation error:', err)
      toast.error(err.response?.data?.message || 'Failed to create order')
      setCreatingOrder(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    
    setLoading(true)
    try {
      const orderResponse = await axios.post('http://localhost:5000/api/orders', 
        { ...createOrderData(), paymentMethod: 'cod', paymentStatus: 'pending' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      clearCart()
      
      toast.success('🎉 Order placed successfully!')
      navigate(`/order-success?id=${orderResponse.data._id}`)
      
    } catch (err) {
      console.error('Order error:', err)
      toast.error(err.response?.data?.message || 'Order failed!')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    if (paymentInitiatedRef.current) return
    paymentInitiatedRef.current = true
    
    try {
      await axios.post('http://localhost:5000/api/payments/payment-success', {
        orderId: orderId,
        sessionId: paymentData?.sessionId,
        paymentDetails: {
          transactionId: paymentData?.paymentIntentId,
          cardLast4: paymentData?.cardLast4,
          cardBrand: paymentData?.cardBrand,
          receiptUrl: paymentData?.receiptUrl
        }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      clearCart()
      
      toast.success('🎉 Payment successful! Order confirmed.')
      navigate(`/order-success?id=${orderId}`)
    } catch (err) {
      console.error('Error processing payment success:', err)
      toast.warning('Payment successful but cart may not be cleared')
      navigate(`/order-success?id=${orderId}`)
    } finally {
      paymentInitiatedRef.current = false
    }
  }

  const handlePaymentError = (error) => {
    console.error('Payment error:', error)
    toast.error(`Payment failed: ${error.message || 'Please try again'}`)
    paymentInitiatedRef.current = false
  }

  const handlePaymentCancel = () => {
    toast.info('Payment cancelled')
    paymentInitiatedRef.current = false
  }

  const handleRetryPayment = async () => {
    paymentInitiatedRef.current = false
    setCreatingOrder(false)
    toast.info('Please click "Proceed to Payment" again to retry')
  }

  const handleCancelFailedOrder = async () => {
    if (window.confirm('Cancel this failed order? You can create a new order.')) {
      try {
        await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        toast.success('Failed order cancelled')
        setOrderId(null)
        setOrder(null)
        setPaymentStatus(null)
      } catch (err) {
        toast.error('Failed to cancel order')
      }
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
            
            {paymentStatus === 'failed' && order && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <i className="fas fa-times-circle text-red-600 text-2xl"></i>
                  <h2 className="text-xl font-bold text-red-700">Payment Failed!</h2>
                </div>
                <p className="text-red-600 mb-4">
                  Your payment could not be processed. Please try again.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleRetryPayment} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <i className="fas fa-sync-alt mr-2"></i> Try Again
                  </button>
                  <button onClick={handleCancelFailedOrder} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                    <i className="fas fa-times mr-2"></i> Cancel Order
                  </button>
                </div>
              </div>
            )}
            
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name</label>
                  <input type="text" value={user?.name || ''} disabled className="w-full border p-2 rounded bg-gray-50"/>
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
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500 mb-3">
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4"/>
                <div className="flex-1">
                  <span className="font-semibold">Cash on Delivery</span>
                  <p className="text-sm text-gray-500">Pay when you receive the order</p>
                </div>
                <div className="text-2xl">💵</div>
              </label>
              
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={e => setPaymentMethod(e.target.value)} className="mr-3 w-4 h-4"/>
                <div className="flex-1">
                  <span className="font-semibold">Credit / Debit Card</span>
                  <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                </div>
                <div className="text-2xl">💳</div>
              </label>
            </div>
          </div>
          
          {/* Order Summary */}
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
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%)</span>
                  <span>Rs. {gstAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t mt-3 pt-3 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">Rs. {grandTotal.toLocaleString()}</span>
              </div>
              
              {/* Buttons */}
              {paymentStatus === 'failed' ? (
                <button onClick={handleRetryPayment} className="w-full mt-6 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600">
                  <i className="fas fa-sync-alt mr-2"></i> Retry Payment
                </button>
              ) : paymentMethod === 'cod' ? (
                <button onClick={handleSubmit} disabled={loading || !form.street || !form.city || !form.zip || !form.phone} className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                  {loading ? 'Processing...' : 'Place Order (COD)'}
                </button>
              ) : (
                <>
                  {!orderId ? (
                    <button onClick={handleCardPayment} disabled={creatingOrder || !form.street || !form.city || !form.zip || !form.phone} className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
                      {creatingOrder ? 'Creating Order...' : 'Proceed to Payment'}
                    </button>
                  ) : (
                    <StripeCheckout orderId={orderId} amount={Math.round(grandTotal)} disabled={paymentStatus === 'failed'} onSuccess={handlePaymentSuccess} onError={handlePaymentError} onCancel={handlePaymentCancel} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout