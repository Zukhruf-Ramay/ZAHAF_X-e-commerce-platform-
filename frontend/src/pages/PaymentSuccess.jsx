import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { user, token } = useAuth()
  const { clearCart } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // ✅ Use ref to prevent multiple calls
  const hasClearedCart = useRef(false)
  const hasFetchedOrder = useRef(false)

  useEffect(() => {
    const fetchOrderBySession = async () => {
      // ✅ Prevent multiple fetches
      if (hasFetchedOrder.current) return
      hasFetchedOrder.current = true
      
      if (!sessionId || !token) {
        setLoading(false)
        return
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/api/payments/order-by-session/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        setOrder(response.data)
        toast.success('Payment successful! Your order has been confirmed.')
        
      } catch (err) {
        console.error('Failed to fetch order:', err)
        toast.error('Payment successful but could not fetch order details')
      } finally {
        setLoading(false)
      }
    }
    
    const clearUserCart = async () => {
      // ✅ Prevent multiple cart clears
      if (hasClearedCart.current) return
      hasClearedCart.current = true
      
      try {
        await clearCart()
        console.log('✅ Cart cleared after successful payment')
      } catch (err) {
        console.error('Failed to clear cart:', err)
      }
    }
    
    fetchOrderBySession()
    clearUserCart()
    
    // ✅ Empty dependency array - run only once
  }, [sessionId, token, clearCart])

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
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="font-mono text-xs">{order.transactionId.slice(-8)}</span>
                </div>
              )}
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