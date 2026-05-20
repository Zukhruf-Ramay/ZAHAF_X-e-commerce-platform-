import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const OrderSuccess = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('id')
  const { user, token } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const fetchOrder = async () => {
      if (!orderId || !token) {
        setLoading(false)
        return
      }
      
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        setOrder(response.data)
      } catch (err) {
        console.error('Failed to fetch order:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrder()
  }, [orderId, token, user?._id])

  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'card': return 'Credit/Debit Card'
      case 'cod': return 'Cash on Delivery'
      default: return method || 'Not specified'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in-up max-w-2xl">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with ZAHAF_X</p>
        
        {/* Order Details */}
        {order && (
          <div className="bg-gray-50 rounded-lg p-4 my-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Order ID:</span> #{order._id?.slice(-8)}</p>
              <p><span className="text-gray-500">Total Amount:</span> Rs. {order.totalAmount?.toLocaleString()}</p>
              <p><span className="text-gray-500">Payment Method:</span> {getPaymentMethodText(order.paymentMethod)}</p>
              <p>
                <span className="text-gray-500">Payment Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </p>
              {order.transactionId && (
                <p><span className="text-gray-500">Transaction ID:</span> <span className="font-mono text-xs">{order.transactionId.slice(-8)}</span></p>
              )}
            </div>
          </div>
        )}
        
        <p className="text-gray-500 mb-8">You will receive a confirmation email shortly</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Continue Shopping
          </Link>
          <Link
            to="/orders"
            className="inline-block border border-blue-500 text-blue-500 px-6 py-3 rounded-lg hover:bg-blue-50 transition duration-300"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess