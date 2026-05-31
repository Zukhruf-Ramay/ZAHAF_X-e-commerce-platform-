import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrderContext'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const orderId = searchParams.get('order')
  const { token } = useAuth()
  const { clearCart } = useCart()
  const { refreshOrders } = useOrders()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const processed = useRef(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const processPayment = async () => {
      if (processed.current) return
      
      // Handle COD orders (orderId from URL)
      if (orderId && !sessionId) {
        processed.current = true
        try {
          const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setOrder(response.data)
          await clearCart()
          await refreshOrders()
          toast.success('Order placed successfully!')
        } catch (err) {
          console.error('Error:', err)
          toast.error('Something went wrong')
        } finally {
          setLoading(false)
        }
        return
      }
      
      // Handle Stripe card payments
      if (sessionId) {
        processed.current = true
        try {
          const verifyResponse = await axios.get(`${API_URL}/api/payments/verify-payment?session_id=${sessionId}`)
          
          if (verifyResponse.data.success) {
            const orderData = verifyResponse.data.order
            setOrder(orderData)
            
            if (token) {
              await clearCart()
              await refreshOrders()
            }
            
            localStorage.removeItem('pendingOrderId')
            localStorage.removeItem('stripeSessionId')
            toast.success('Payment successful! Your order has been confirmed.')
          } else {
            toast.error('Payment verification failed')
          }
        } catch (err) {
          console.error('Error:', err)
          toast.error('Payment verification failed')
        } finally {
          setLoading(false)
        }
      }
    }
    
    processPayment()
  }, [sessionId, orderId, token, clearCart, refreshOrders, API_URL])

  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'card': return 'Credit/Debit Card'
      case 'cod': return 'Cash on Delivery'
      default: return method || 'Not specified'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-500">Verifying payment...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-7xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">Your order has been confirmed and is being processed.</p>
        
        {order && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono">#{order._id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-semibold">Rs. {order.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span>{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <span className="text-green-600 font-semibold">PAID</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
            View My Orders
          </Link>
          <Link to="/products" className="border border-blue-500 text-blue-500 px-6 py-3 rounded-lg hover:bg-blue-50 transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess