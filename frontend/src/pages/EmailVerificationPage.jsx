import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EmailVerificationPage = () => {
  const { token } = useParams()
  const { verifyEmail } = useAuth()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      const isSuccess = await verifyEmail(token)
      setSuccess(isSuccess)
      setLoading(false)
    }

    handleVerification()
  }, [token, verifyEmail])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-500">Verifying your email...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        {success ? (
          <>
            <div className="text-6xl mb-4 text-green-500">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">Your account is now active. You can proceed to login.</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 text-red-500">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Email Verification Failed</h2>
            <p className="text-gray-600 mb-6">The verification link may be invalid or expired. Please try registering again or contact support.</p>
            <Link to="/register" className="inline-block bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition">Register Again</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default EmailVerificationPage