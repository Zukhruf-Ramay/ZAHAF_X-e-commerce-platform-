import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />
  }

  // Check admin access
  if (adminOnly) {
    const isAdmin = user?.publicMetadata?.role === 'admin'
    if (!isAdmin) {
      return <Navigate to="/" />
    }
  }

  return children
}

export default ProtectedRoute