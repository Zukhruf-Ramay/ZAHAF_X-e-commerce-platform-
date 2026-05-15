import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const ManageOrders = () => {
  const { user, isSignedIn } = useUser()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const token = await window.Clerk?.session?.getToken()
      const res = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(res.data)
    } catch {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchOrders()
      })
    }
  }, [isSignedIn, user, fetchOrders])

  const updateStatus = async (id, status) => {
    try {
      const token = await window.Clerk?.session?.getToken()
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Status updated!')
      fetchOrders()
    } catch {
      toast.error('Failed to update status')
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

  if (loading) return <div className="text-center py-20">Loading orders...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Orders</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-6 py-3 text-left">Order ID</th><th className="px-6 py-3 text-left">Customer</th><th className="px-6 py-3 text-left">Date</th><th className="px-6 py-3 text-left">Total</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Actions</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t">
                  <td className="px-6 py-4 font-mono text-sm">#{order._id.slice(-8)}</td>
                  <td className="px-6 py-4">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold">Rs. {order.totalAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status} 
                      onChange={e => updateStatus(order._id, e.target.value)} 
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                    >
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/admin/orders/${order._id}`} className="text-blue-500 hover:text-blue-700">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManageOrders