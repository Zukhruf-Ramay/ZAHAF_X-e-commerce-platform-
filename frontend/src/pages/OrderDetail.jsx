import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const OrderDetail = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!token) {
      console.log('No token available')
      toast.error('Authentication required')
      navigate('/login')
      return
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      setOrder(response.data)
    } catch (err) {
      console.error('Error fetching order:', err)
      toast.error(err.response?.data?.message || 'Failed to load order details')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }, [id, token, navigate])

  useEffect(() => {
    if (user && token) {
      fetchOrder()
    } else if (!token) {
      setLoading(false)
      navigate('/login')
    }
  }, [user, token, fetchOrder, navigate])

  const cancelOrder = async (orderId) => {
    if (cancelling) return
    
    if (!['pending', 'processing'].includes(order?.status)) {
      toast.error(`Cannot cancel order that is ${order?.status}`)
      return
    }
    
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return
    
    setCancelling(true)
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
        }
      })
      
      if (response.data.order.paymentStatus === 'refunded') {
        toast.success(`Order cancelled and refund of Rs. ${response.data.order.refundedAmount?.toLocaleString()} processed`)
      } else {
        toast.success('Order cancelled successfully')
      }
      
      fetchOrder()
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

  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'card': return 'Credit/Debit Card'
      case 'cod': return 'Cash on Delivery'
      case 'bank_transfer': return 'Bank Transfer'
      default: return method || 'Not specified'
    }
  }

  const canCancel = order && ['pending', 'processing'].includes(order.status)
  const isRefunded = order?.paymentStatus === 'refunded'
  const isPaid = order?.paymentStatus === 'paid'

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

  const getProductImage = (product) => {
    if (!product) return 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
    return product.mainImage || (product.images?.[0]) || product.image || 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="text-blue-500 hover:text-blue-600 mb-4 flex items-center gap-1"
      >
        <i className="fas fa-arrow-left mr-1"></i> Back to My Orders
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Order Header */}
        <div className="flex justify-between items-start flex-wrap gap-3 mb-4 border-b pb-4">
          <div>
            <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-gray-700">#{order._id?.slice(-8)}</span></p>
            <p className="text-xs text-gray-400">
              Placed on: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
            {order.status?.toUpperCase()}
          </span>
        </div>

        {/* Refund Information Section */}
        {isRefunded && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-undo-alt text-orange-600"></i>
              <h2 className="font-semibold text-orange-800">Refund Processed</h2>
            </div>
            <p className="text-sm text-orange-700">
              Amount refunded: <strong>Rs. {(order.refundedAmount || order.totalAmount).toLocaleString()}</strong>
            </p>
            {order.refundedAt && (
              <p className="text-xs text-orange-600 mt-1">
                Refunded on: {new Date(order.refundedAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-orange-600 mt-1">
              Payment status: <span className="font-semibold uppercase">{order.paymentStatus}</span>
            </p>
          </div>
        )}

        {/* Payment Information */}
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
              <div className="md:col-span-2">
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
            {order.paymentDetails?.cardLast4 && order.paymentDetails.cardLast4 !== 'N/A' && (
              <div>
                <p className="text-gray-500">Card Details</p>
                <p>{order.paymentDetails.cardBrand} •••• {order.paymentDetails.cardLast4}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-6 border rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-shipping-fast text-blue-500"></i> Shipping Address
          </h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Name:</span> {order.shippingAddress?.name || 'N/A'}</p>
            <p>{order.shippingAddress?.street || 'N/A'}</p>
            <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.zip || 'N/A'}</p>
            <p><span className="text-gray-500">Phone:</span> {order.phone || 'N/A'}</p>
            <p><span className="text-gray-500">Email:</span> {order.email || 'N/A'}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-box-open text-green-500"></i> Items in this Order
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
                          <Link to={`/products/${item.product?._id}`} className="font-medium text-gray-800 hover:text-blue-600">
                            {item.product?.name || 'Product'}
                          </Link>
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

        {/* ✅ Professional Price Breakdown - ADD THIS SECTION */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <i className="fas fa-calculator text-blue-500"></i> Price Breakdown
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">Rs. {(order.subtotal || (order.totalAmount / 1.18)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-dashed">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium">Rs. {(order.gstAmount || (order.totalAmount * 0.18 / 1.18)).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold text-gray-800">Total Amount</span>
              <span className="font-bold text-blue-600 text-lg">Rs. {order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cancel Button Section */}
        <div className="border-t pt-4 flex justify-between items-center">
          <div className="text-sm">
            {isRefunded && (
              <span className="text-orange-600 font-medium">
                <i className="fas fa-check-circle mr-1"></i> Refunded
              </span>
            )}
            {isPaid && order.status !== 'cancelled' && !isRefunded && (
              <span className="text-green-600 font-medium">
                <i className="fas fa-check-circle mr-1"></i> Payment Completed
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {!canCancel && order.status !== 'cancelled' && (
              <span className="text-xs text-gray-400 italic">
                {order.status === 'shipped' && 'Cannot cancel - Order has been shipped'}
                {order.status === 'delivered' && 'Cannot cancel - Order has been delivered'}
                {order.status === 'processing' && 'Order is being processed'}
              </span>
            )}
            
            <button
              onClick={() => cancelOrder(order._id)}
              disabled={!canCancel || cancelling}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                canCancel && !cancelling
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {cancelling ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-times-circle mr-2"></i>
                  Cancel Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail