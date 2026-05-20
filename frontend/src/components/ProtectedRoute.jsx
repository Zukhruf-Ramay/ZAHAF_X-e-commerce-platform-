import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  // Show loading spinner while Auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check admin access if required
  if (adminOnly) {
    const isAdmin = user?.role === 'admin'
    if (!isAdmin) {
      // Redirect non-admin users to home page
      return <Navigate to="/" replace />
    }
  }

  // User is authenticated and has required permissions
  return children
}

export default ProtectedRoute