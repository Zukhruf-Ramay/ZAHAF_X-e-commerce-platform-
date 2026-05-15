import { SignIn, useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {
  const { isSignedIn, user } = useUser()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isSignedIn && user) {
      const isVerified = user.primaryEmailAddress?.verification?.status === 'verified'
      if (isVerified) {
        toast.success(`Welcome back!`)
        navigate('/')
      } else {
        toast.warning('Please verify your email first!')
      }
    }
  }, [isSignedIn, user, navigate])

  // Handle Clerk errors
  const handleError = (err) => {
    console.error('Clerk error:', err)
    
    if (err?.errors?.[0]?.code === 'form_identifier_not_found') {
      setError('No account found with this email address')
      toast.error('No account found with this email address')
    } 
    else if (err?.errors?.[0]?.code === 'form_password_incorrect') {
      setError('Incorrect password. Please try again.')
      toast.error('Incorrect password. Please try again.')
    }
    else {
      setError(err?.errors?.[0]?.message || 'Login failed. Please try again.')
      toast.error(err?.errors?.[0]?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Login to ZAHAF-X
        </h2>
        
        {/* Show error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <SignIn 
          routing="path" 
          path="/login"
          signUpUrl="/register"
          afterSignInUrl="/"
          onError={handleError}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg',
              card: 'shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
            },
          }}
        />
        
        <p className="text-center text-gray-500 mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </div>
    </div>
  )
}

export default Login