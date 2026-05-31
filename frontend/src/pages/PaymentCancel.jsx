import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useState } from 'react'

const PaymentCancel = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const reason = searchParams.get('reason')
  const { token } = useAuth()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  // ❌ REMOVED auto-cancel useEffect - Order will NOT cancel automatically

  const handleCancelOrder = async () => {
    if (loading) return
    
    const pendingOrderId = localStorage.getItem('pendingOrderId') || orderId
    if (pendingOrderId && token) {
      setLoading(true)
      try {
        const response = await axios.put(
          `${API_URL}/api/orders/${pendingOrderId}/cancel`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        if (response.data.success) {
          localStorage.removeItem('pendingOrderId')
          localStorage.removeItem('stripeSessionId')
          await clearCart()
          toast.success(response.data.message || 'Order cancelled successfully')
          navigate('/products')
        } else {
          toast.error(response.data.message || 'Failed to cancel order')
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Failed to cancel order'
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    } else {
      navigate('/products')
    }
  }

  const handleContinueShopping = async () => {
    // ✅ Keep the order active - don't cancel
    // Just clear local storage and redirect to products
    localStorage.removeItem('pendingOrderId')
    localStorage.removeItem('stripeSessionId')
    
    // Optional: Clear cart so user can add new items
    await clearCart()
    
    toast.info('You can add more items to your order')
    navigate('/products')
  }

  const handleRetryPayment = () => {
    const pendingOrderId = localStorage.getItem('pendingOrderId') || orderId
    if (pendingOrderId) {
      navigate(`/checkout?retry=${pendingOrderId}`)
    } else {
      navigate('/checkout')
    }
  }

  const getErrorMessage = () => {
    switch(reason) {
      case 'payment_not_completed':
        return 'Your payment was not completed. No charges were made.'
      case 'verification_failed':
        return 'We could not verify your payment. Please contact support.'
      case 'missing_session':
        return 'Payment session information is missing.'
      default:
        return 'Your payment was cancelled. No charges were made to your account.'
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-7xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          {getErrorMessage()}
          <br />
          You can try again or continue shopping.
        </p>
        
        {loading && (
          <div className="mb-4 text-blue-500">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></span>
            Processing...
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetryPayment}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
          >
            Try Again
          </button>
          <button
            onClick={handleContinueShopping}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            Continue Shopping
          </button>
          <button
            onClick={handleCancelOrder}
            disabled={loading}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel