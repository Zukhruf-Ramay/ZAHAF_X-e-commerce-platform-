import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
      toast.success('OTP sent to your email!')
      // ✅ Redirect to reset password page with email
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Forgot Password</h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you an OTP to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-500 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword