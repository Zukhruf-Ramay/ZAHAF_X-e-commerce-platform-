import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, isSignedIn } = useUser()
  
  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin'

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
    pendingOrders: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const token = await window.Clerk?.session?.getToken()

      const productsRes = await axios.get(
        'http://localhost:5000/api/products'
      )

      const ordersRes = await axios.get(
        'http://localhost:5000/api/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const orders = ordersRes.data

      const totalRevenue = orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      )

      const pendingOrders = orders.filter(
        (order) => order.status === 'pending'
      ).length

      setStats({
        products: productsRes.data.length,
        orders: orders.length,
        users: 0,
        revenue: totalRevenue,
        pendingOrders
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (err) {
      console.error('Failed to fetch data', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchData()
      })
    }
  }, [isSignedIn, user, fetchData])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      
      {/* Header with Admin Badge */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
            <p className="text-gray-500 mt-3">
              Welcome back, {user?.fullName || 'Admin'}!
            </p>
          </div>
          
          {/* Admin Badge */}
          {isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
              <span>👑</span> Admin Access
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">

        {/* Products */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Total Products
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.products}
              </p>
            </div>
            <div className="text-3xl">📦</div>
          </div>
          <Link
            to="/admin/products"
            className="text-sm text-blue-500 mt-3 inline-block hover:underline"
          >
            Manage Products →
          </Link>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.orders}
              </p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
          <Link
            to="/admin/orders"
            className="text-sm text-green-500 mt-3 inline-block hover:underline"
          >
            Manage Orders →
          </Link>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Pending Orders
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </p>
            </div>
            <div className="text-3xl">⏳</div>
          </div>
          <Link
            to="/admin/orders?filter=pending"
            className="text-sm text-yellow-500 mt-3 inline-block hover:underline"
          >
            View Pending →
          </Link>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-purple-600">
                Rs. {stats.revenue.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">

        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Recent Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-blue-500 hover:text-blue-600 text-sm font-semibold"
          >
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    Rs. {order.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard