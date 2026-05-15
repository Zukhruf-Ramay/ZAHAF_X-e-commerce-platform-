import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { toast } from 'react-toastify'

const OrderDetail = () => {
  const { id } = useParams()
  const { user, isSignedIn } = useUser()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = useCallback(async () => {
    try {
      const token = await window.Clerk?.session?.getToken()
      const clerkId = user?.id

      const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Clerk-ID': clerkId
        }
      })
      setOrder(res.data)
    } catch (err) {
      console.error('Failed to fetch order:', err)
      toast.error('Failed to fetch order')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }, [id, user, navigate])

  useEffect(() => {
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchOrder()
      })
    }
  }, [id, isSignedIn, user, fetchOrder])

  const updateStatus = async (status) => {
    try {
      const token = await window.Clerk?.session?.getToken()
      const clerkId = user?.id
      
      await axios.put(
        `http://localhost:5000/api/orders/${id}/status`,
        { status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'X-Clerk-ID': clerkId
          } 
        }
      )
      toast.success(`Status updated to ${status}`)
      fetchOrder()
    } catch (err) {
      console.error('Failed to update status:', err)
      toast.error('Failed to update status')
    }
  }

  // ✅ Helper function to get product image
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="text-blue-500 hover:text-blue-600 mb-4 flex items-center gap-1"
      >
        ← Back to Orders
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
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-700">Change Status:</span>
              <select
                value={order.status}
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Customer Info */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>👤</span> Customer Information
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {order.user?.name || 'N/A'}</p>
                <p><span className="text-gray-500">Email:</span> {order.user?.email || 'N/A'}</p>
                <p><span className="text-gray-500">Phone:</span> {order.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span>📍</span> Shipping Address
              </h2>
              <div className="space-y-2 text-sm">
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.zip}</p>
              </div>
            </div>
          </div>

          {/* Order Items with Images */}
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>🛍️</span> Order Items
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
                  {order.items?.map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* ✅ FIXED: Product image with proper mapping */}
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
                        Rs. {(item.quantity * item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-right font-semibold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">
                      Rs. {order.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span>📅</span> Order Timeline
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Placed:</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              {order.updatedAt !== order.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{new Date(order.updatedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail