import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

const OrderHistory = () => {
  const { user, isSignedIn, isLoaded } = useUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)

      const token = await window.Clerk?.session?.getToken()
      const clerkId = user?.id

      console.log('Fetching orders for user:', clerkId)

      const response = await axios.get('http://localhost:5000/api/orders/myorders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Clerk-ID': clerkId,
          'Content-Type': 'application/json'
        }
      })

      console.log('Orders received:', response.data)
      setOrders(response.data)
    } catch (err) {
      console.error('Error fetching orders:', err)
      toast.error(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchOrders()
      })
      return
    }
    if (!isSignedIn) {
      queueMicrotask(() => setLoading(false))
    }
  }, [isLoaded, isSignedIn, user, fetchOrders])

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    try {
      const token = await window.Clerk?.session?.getToken()
      const clerkId = user?.id
      
      await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Clerk-ID': clerkId
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

  if (!isLoaded || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
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

            <div className="border-t mt-4 pt-4 flex justify-between items-center flex-wrap gap-3">
              <div>
                <p className="text-sm text-gray-500">
                  {order.items?.length || 0} items
                </p>
                {order.paymentMethod === 'cod' && (
                  <p className="text-xs text-gray-400">Cash on Delivery</p>
                )}
              </div>
              <p className="text-xl font-bold text-blue-600">
                Rs. {order.totalAmount?.toLocaleString()}
              </p>
            </div>

            {(order.status === 'pending' || order.status === 'processing') && (
              <div className="border-t mt-4 pt-4 flex justify-end">
                <button
                  onClick={() => cancelOrder(order._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Cancel Order
                </button>
              </div>
            )}

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