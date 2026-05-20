import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const OrderHistory = () => {
  const { user, token, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!token) return
    try {
      const response = await axios.get('http://localhost:5000/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setOrders(response.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      toast.error(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (authLoading) return
    if (user && token) {
      fetchOrders()
      return
    }
    if (!user) {
      setLoading(false)
    }
  }, [authLoading, user, token, fetchOrders])

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      })
      
      toast.success('Order cancelled successfully')
      fetchOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-orange-100 text-orange-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'card': return '💳'
      case 'cod': return '💵'
      case 'bank_transfer': return '🏦'
      default: return '💳'
    }
  }

  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'card': return 'Credit/Debit Card'
      case 'cod': return 'Cash on Delivery'
      case 'bank_transfer': return 'Bank Transfer'
      default: return method || 'Not specified'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Please login to view your orders</p>
          <Link to="/login" className="bg-blue-500 text-white px-6 py-2 rounded-lg">Login</Link>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-7xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No Orders Yet</h2>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link to="/products" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            {/* Order Header */}
            <div className="flex justify-between items-start flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>

            {/* Payment Information Row */}
            <div className="flex flex-wrap gap-4 mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Payment:</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  {getPaymentMethodIcon(order.paymentMethod)} {getPaymentMethodText(order.paymentMethod)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Payment Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Transaction ID:</span>
                  <span className="text-xs font-mono text-gray-600">{order.transactionId.slice(-8)}</span>
                </div>
              )}
              {order.paidAt && order.paymentStatus === 'paid' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Paid On:</span>
                  <span className="text-xs text-gray-600">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t mt-3 pt-3 flex justify-between items-center flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {order.items?.length || 0} items
                </p>
              </div>
              <p className="text-xl font-bold text-blue-600">
                Rs. {order.totalAmount?.toLocaleString()}
              </p>
            </div>

            {/* Feature 2: Cancel Button Condition & Feature 3: Refund Info */}
            <div className="border-t mt-3 pt-3 flex justify-end items-center gap-3">
              {order.isRefunded && (
                <span className="text-xs text-red-500 font-medium">Refunded: Rs. {order.refundedAmount?.toLocaleString()}</span>
              )}
              {['shipped', 'delivered', 'cancelled'].includes(order.status) && (
                <span className="text-xs text-gray-400 italic">Cannot cancel {order.status} orders</span>
              )}
              {/* Cancel Button */}
                <button
                  onClick={() => cancelOrder(order._id)}
                  disabled={!['pending', 'processing'].includes(order.status)}
                  className={`text-sm font-medium ${
                    ['pending', 'processing'].includes(order.status) 
                      ? 'text-red-500 hover:text-red-700' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Cancel Order
                </button>
            </div>

            {/* Order Items Details */}
            <details className="mt-4">
              <summary className="text-sm text-blue-500 cursor-pointer hover:text-blue-600">
                View Order Items
              </summary>
              <div className="mt-3 space-y-2">
                {order.items?.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      <span className="font-medium">{item.product?.name}</span>
                      <span className="text-gray-500 ml-2">x {item.quantity}</span>
                    </div>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderHistory