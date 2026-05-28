import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PaymentCancel = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { clearCart } = useCart()  // ✅ ADD THIS
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const handleCancelOrder = async () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId')
    if (pendingOrderId && token) {
      try {
        await axios.put(
          `${API_URL}/api/orders/${pendingOrderId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        localStorage.removeItem('pendingOrderId')
        localStorage.removeItem('stripeSessionId')
        
        // ✅ Clear cart when order is cancelled
        clearCart()
        
        toast.success('Order cancelled successfully')
        navigate('/products')
      } catch (error) {
        toast.error('Failed to cancel order')
      }
    } else {
      navigate('/products')
    }
  }

  const handleRetryPayment = () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId')
    if (pendingOrderId) {
      navigate(`/checkout?retry=${pendingOrderId}`)
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-7xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          Your payment was cancelled. No charges were made to your account.
          You can try again or choose another payment method.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetryPayment}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Try Again
          </button>
          <button
            onClick={handleCancelOrder}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Cancel Order
          </button>
          <Link
            to="/products"
            className="border border-blue-500 text-blue-500 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel