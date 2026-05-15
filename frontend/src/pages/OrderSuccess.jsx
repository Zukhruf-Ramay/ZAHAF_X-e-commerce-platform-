import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const OrderSuccess = () => {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-in-up">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          Order Placed Successfully! 🎉
        </h1>
        <p className="text-gray-500 mb-2">Thank you for shopping with ZAHAF_X</p>
        <p className="text-gray-500 mb-8">You will receive a confirmation email shortly</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="inline-block border border-blue-500 text-blue-500 px-6 py-3 rounded-lg hover:bg-blue-50 transition duration-300"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess