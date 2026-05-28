import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'
import { toast } from 'react-toastify'

const OrderHistory = () => {
  // ✅ CHANGE: refreshOrders → fetchOrders
  const { orders, loading, fetchOrders } = useOrders()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()  // ✅ CHANGE: refreshOrders → fetchOrders
  }, [fetchOrders])

  // Manual refresh function
  const handleRefresh = async () => {
    setRefreshing(true)
    toast.info('Refreshing orders...')
    await fetchOrders()  // ✅ CHANGE: refreshOrders → fetchOrders
    toast.success('Orders refreshed!')
    setRefreshing(false)
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
      case 'refunded': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        
        {/* Refresh Button */}
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
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No orders yet</p>
          <Link to="/products" className="text-blue-500 mt-2 inline-block hover:underline">Start Shopping →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order #{order._id?.slice(-8)}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status?.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus === 'paid' && <i className="fas fa-check-circle mr-1"></i>}
                    {order.paymentStatus === 'refunded' && <i className="fas fa-undo-alt mr-1"></i>}
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
              
              <div className="border-t mt-3 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Total:</span>
                  <span className="font-bold text-blue-600 ml-2">Rs. {order.totalAmount?.toLocaleString()}</span>
                </div>
                <Link to={`/order/${order._id}`} className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
                  View Details <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderHistory