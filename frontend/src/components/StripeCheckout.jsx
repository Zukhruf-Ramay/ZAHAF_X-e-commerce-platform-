import { useState, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const StripeCheckout = ({ orderId, amount, disabled, onSuccess, onError }) => {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const paymentInitiatedRef = useRef(false)

  const handleCheckout = async () => {
    // ✅ Prevent multiple clicks
    if (paymentInitiatedRef.current || loading || paymentInitiated) {
      console.log('Payment already initiated, ignoring click')
      return
    }
    
    if (!orderId) {
      console.error('No orderId provided')
      onError?.('Invalid order. Please try again.')
      return
    }

    paymentInitiatedRef.current = true
    setPaymentInitiated(true)
    setLoading(true)
    
    try {
      console.log('Creating Stripe session for order:', orderId)
      
      const response = await axios.post(
        'http://localhost:5000/api/payments/create-checkout-session',
        { orderId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      console.log('Stripe session created:', response.data)
      
      // Store session ID in localStorage to track on return
      localStorage.setItem('stripeSessionId', response.data.sessionId)
      localStorage.setItem('pendingOrderId', orderId)
      
      // Redirect to Stripe checkout page
      window.location.href = response.data.url
      
    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error.response?.data?.error || 'Payment failed. Please try again.'
      onError?.(errorMessage)
      alert(errorMessage)
      
      // Reset on error so user can try again
      paymentInitiatedRef.current = false
      setPaymentInitiated(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || loading || paymentInitiated || !orderId}
      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
    >
      {loading ? 'Processing...' : paymentInitiated ? 'Redirecting...' : `💳 Pay Rs. ${amount?.toLocaleString()}`}
    </button>
  )
}

export default StripeCheckout