import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user, token } = useAuth()

  const isAdmin = user?.role === 'admin'

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    totalRevenue: 0,
    refundedAmount: 0,
    netRevenue: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      // Fetch products
      const productsRes = await axios.get(
        'http://localhost:5000/api/products'
      )

      // Fetch orders
      const ordersRes = await axios.get(
        'http://localhost:5000/api/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-User-ID': user?._id
          }
        }
      )

      const orders = ordersRes.data

      // Revenue calculations
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)

      const refundedAmount = orders
        .filter(o => o.paymentStatus === 'refunded')
        .reduce(
          (sum, o) => sum + (o.refundedAmount || o.totalAmount || 0),
          0
        )

      const netRevenue = totalRevenue - refundedAmount

      setStats({
        products: productsRes.data.length,
        orders: orders.length,
        totalRevenue,
        refundedAmount,
        netRevenue
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    if (user && token) {
      fetchData()
    }
  }, [user, token, fetchData])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              <i className="fas fa-tachometer-alt mr-2 text-blue-500"></i>
              Admin Dashboard
            </h1>

            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>

            <p className="text-gray-500 mt-3">
              Welcome back, {user?.name || 'Admin'}!
            </p>
          </div>

          {isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold flex items-center gap-1">
               Admin Access
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        {/* Products */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Products</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.products}
              </p>
            </div>

            <i className="fas fa-boxes text-3xl text-blue-400"></i>
          </div>

          <Link
            to="/admin/products"
            className="text-sm text-blue-500 mt-3 inline-block hover:underline"
          >
            Manage Products →
          </Link>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Orders</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.orders}
              </p>
            </div>

            <i className="fas fa-shopping-cart text-3xl text-green-400"></i>
          </div>

          <Link
            to="/admin/orders"
            className="text-sm text-green-500 mt-3 inline-block hover:underline"
          >
            Manage Orders →
          </Link>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                Rs. {stats.totalRevenue.toLocaleString()}
              </p>
            </div>

            <i className="fas fa-chart-line text-3xl text-green-400"></i>
          </div>
        </div>

        {/* Refunded */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Refunded</p>
              <p className="text-2xl font-bold text-red-600">
                Rs. {stats.refundedAmount.toLocaleString()}
              </p>
            </div>

            <i className="fas fa-undo-alt text-3xl text-red-400"></i>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Net Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                Rs. {stats.netRevenue.toLocaleString()}
              </p>
            </div>

            <i className="fas fa-coins text-3xl text-purple-400"></i>
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
            View All →
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
              {recentOrders.map(order => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors"
                >
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
                    <div className="flex flex-col gap-1">
                      {/* Order Status */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>

                      {/* Payment Status */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'refunded'
                            ? 'bg-orange-100 text-orange-700'
                            : order.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
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
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
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