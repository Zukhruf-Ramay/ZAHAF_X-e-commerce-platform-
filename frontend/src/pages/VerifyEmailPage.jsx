import { Link } from 'react-router-dom'

const VerifyEmailPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <div className="text-6xl mb-4">📧</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Verify Your Email Address</h2>
        <p className="text-gray-600 mb-6">
          A verification link has been sent to your email address. Please check your inbox (and spam folder)
          to activate your account.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          The link will expire in 24 hours.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Login
        </Link>
        <p className="text-gray-500 text-sm mt-4">
          Didn't receive the email? Check your spam folder or <Link to="/resend-verification" className="text-blue-500 hover:underline">resend it</Link>.
        </p>
      </div>
    </div>
  )
}

export default VerifyEmailPage