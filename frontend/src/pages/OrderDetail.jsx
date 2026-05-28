import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { useOrders } from '../context/OrderContext'

const OrderDetail = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const { refreshOrders } = useOrders()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrder = async (showToast = false) => {
    if (!token) return

    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { _t: Date.now() }
      })
      setOrder(response.data)
      if (showToast) {
        toast.success('Order details refreshed!')
      }
    } catch (err) {
      console.error('Error fetching order:', err)
      toast.error('Failed to load order details')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('Refreshing order details...')
    await fetchOrder(true)
    await refreshOrders()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchOrder()
  }, [id, token])

  const cancelOrder = async () => {
    if (cancelling) return
    
    if (!['pending', 'processing'].includes(order?.status)) {
      toast.error(`Cannot cancel order that is ${order?.status}`)
      return
    }
    
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    
    setCancelling(true)
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.data.order.paymentStatus === 'refunded') {
        toast.success(`Order cancelled and refund of Rs. ${response.data.order.refundedAmount?.toLocaleString()} processed`)
      } else {
        toast.success('Order cancelled successfully')
      }
      
      await fetchOrder(true)
      await refreshOrders()
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
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

  const getProductImage = (product) => {
    if (!product) return 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
    return product.mainImage || (product.images?.[0]) || product.image || 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Order not found!</h2>
        <Link to="/orders" className="text-blue-500 mt-4 inline-block">Back to My Orders</Link>
      </div>
    )
  }

  const canCancel = ['pending', 'processing'].includes(order.status)
  const isRefunded = order.paymentStatus === 'refunded'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
        >
          <i className="fas fa-arrow-left mr-1"></i> Back to My Orders
        </button>
        
        {/* ✅ Working Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
            refreshing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
          {refreshing ? 'Refreshing...' : 'Refresh Order'}
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Last Updated */}
        <div className="text-right text-xs text-gray-400 mb-2">
          Last updated: {new Date().toLocaleTimeString()}
        </div>

        {/* Order Header */}
        <div className="flex justify-between items-start flex-wrap gap-3 mb-4 border-b pb-4">
          <div>
            <p className="text-sm text-gray-500">Order ID: <span className="font-mono">#{order._id?.slice(-8)}</span></p>
            <p className="text-xs text-gray-400">
              Placed on: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
              {order.status?.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
              {order.paymentStatus?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Rest of your order details... */}
        <div className="mb-6 border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Payment Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p>{order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment Status</p>
              <span className={`px-2 py-0.5 rounded-full text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                {order.paymentStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="border-t pt-4 flex justify-end">
          {!canCancel && order.status !== 'cancelled' && (
            <span className="text-xs text-gray-400 italic mr-3">
              {order.status === 'shipped' && 'Cannot cancel - Order has been shipped'}
              {order.status === 'delivered' && 'Cannot cancel - Order has been delivered'}
            </span>
          )}
          
          <button
            onClick={cancelOrder}
            disabled={!canCancel || cancelling}
            className={`px-4 py-2 rounded-lg font-semibold ${
              canCancel && !cancelling
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {cancelling ? 'Processing...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail