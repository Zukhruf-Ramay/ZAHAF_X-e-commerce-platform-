import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

const OrderDetail = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    if (!token) {
      console.log('No token available')
      toast.error('Authentication required')
      navigate('/login')
      return
    }

    try {
      console.log('📦 Fetching order ID:', id)
      console.log('🔑 Token available:', !!token)
      
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ Order fetched:', res.data)
      setOrder(res.data)
    } catch (err) {
      console.error('❌ Failed to fetch order:', err)
      console.error('Response data:', err.response?.data)
      console.error('Status code:', err.response?.status)
      
      const errorMessage = err.response?.data?.message || 'Failed to fetch order'
      toast.error(errorMessage)
      
      // Navigate back if order not found or error
      if (err.response?.status === 404 || err.response?.status === 500) {
        navigate('/admin/orders')
      }
    } finally {
      setLoading(false)
    }
  }, [id, token, navigate])

  useEffect(() => {
    if (user && token) {
      fetchOrder()
    } else if (!token) {
      console.log('No token, redirecting to login')
      navigate('/login')
    }
  }, [user, token, fetchOrder, navigate])

  const updateStatus = async (status) => {
    if (!token) {
      toast.error('Authentication required')
      return
    }

    try {
      console.log('Updating order status:', id, 'to', status)
      
      await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      )
      toast.success(`Status updated to ${status}`)
      fetchOrder()
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const getProductImage = (product) => {
    if (!product) return 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
    return product.mainImage || (product.images?.[0]) || product.image || 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
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

  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'card': return 'Credit/Debit Card'
      case 'cod': return 'Cash on Delivery'
      case 'bank_transfer': return 'Bank Transfer'
      default: return method || 'Not specified'
    }
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
        <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 text-blue-500 hover:text-blue-600"
        >
          Back to Orders
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="text-blue-500 hover:text-blue-600 mb-4 flex items-center gap-1 transition-colors"
      >
        <i className="fas fa-arrow-left mr-1"></i> Back to Orders
      </button>

      {/* Order Header */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Order Details</h1>
          <p className="text-blue-100 text-sm">Order #{order._id}</p>
        </div>

        <div className="p-6">
          {/* Status Update Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Change Status:</span>
              <select
                value={order.status || 'pending'}
                onChange={(e) => updateStatus(e.target.value)}
                className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Refund Information Section */}
          {order.isRefunded && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
              <h2 className="font-semibold text-red-800 mb-1 flex items-center gap-2">
                <i className="fas fa-undo"></i> Refund Processed
              </h2>
              <p className="text-sm text-red-600">
                Amount: <strong>Rs. {order.refundedAmount?.toLocaleString()}</strong> on {new Date(order.refundedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Payment Information Section */}
          <div className="mb-6 border rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-credit-card text-purple-500"></i> Payment Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium">{getPaymentMethodText(order.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Status</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              {order.transactionId && (
                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-mono text-xs break-all">{order.transactionId}</p>
                </div>
              )}
              {order.paidAt && (
                <div>
                  <p className="text-gray-500">Paid At</p>
                  <p>{new Date(order.paidAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <i className="fas fa-user text-blue-500"></i> Customer Information
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {order.user?.name || order.shippingAddress?.name || 'N/A'}</p>
                <p><span className="text-gray-500">Email:</span> {order.email || order.user?.email || 'N/A'}</p>
                <p><span className="text-gray-500">Phone:</span> {order.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-green-500"></i> Shipping Address
              </h2>
              <div className="space-y-2 text-sm">
                <p>{order.shippingAddress?.street || 'N/A'}</p>
                <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.zip || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-shopping-bag text-purple-500"></i> Order Items
            </h2>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items?.map((item, index) => (
                    <tr key={item._id || index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getProductImage(item.product)} 
                            alt={item.product?.name || 'Product'} 
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{item.product?.name || 'Product'}</p>
                            <p className="text-xs text-gray-500">{item.product?.brand || ''} {item.product?.model || ''}</p>
                          </div>
                        </div>
                       </td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">Rs. {item.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        Rs. {((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-semibold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                      Rs. {order.totalAmount?.toLocaleString() || 0}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <i className="fas fa-clock text-orange-500"></i> Order Timeline
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Placed:</span>
                <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{new Date(order.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail