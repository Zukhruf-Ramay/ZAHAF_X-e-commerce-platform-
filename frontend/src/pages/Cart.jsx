import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart()
  const [removingId, setRemovingId] = useState(null)

  const handleRemove = (id) => {
    setRemovingId(id)
    setTimeout(() => {
      removeFromCart(id)
      setRemovingId(null)
    }, 300)
  }

  // Helper function to get correct image URL
  const getProductImage = (item) => {
    if (item.image) return item.image
    if (item.images && item.images.length > 0) return item.images[0]
    if (item.mainImage) return item.mainImage
    return 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">Your Cart is Empty!</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
          <Link 
            to="/products" 
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🛍️ Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Your Cart
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Cart Items - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items List - Left Column (2/3 on desktop) */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {cartItems.map((item, index) => (
            <div 
              key={item._id}
              className={`bg-white rounded-xl shadow-md p-3 sm:p-4 transition-all duration-300 animate-fade-in-up ${
                removingId === item._id ? 'opacity-0 transform -translate-x-full' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Product Image - Fixed with fallback */}
                <div className="flex-shrink-0">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/80x80/e2e8f0/64748b?text=No+Image'
                    }}
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg hover:text-blue-500 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{item.category || 'Electronics'}</p>
                  <p className="text-blue-600 font-bold text-lg sm:text-xl mt-1">
                    Rs. {item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Remove */}
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm transition-colors duration-300 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary - Right Column (1/3 on desktop) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 sticky top-24 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              Order Summary
            </h2>
            
            {/* Items Count */}
            <div className="flex justify-between mb-3 text-gray-600">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            
            {/* Shipping */}
            <div className="flex justify-between mb-3 text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            
            {/* Tax */}
            <div className="flex justify-between mb-3 text-gray-600">
              <span>Tax (GST 18%)</span>
              <span>Rs. {(totalPrice * 0.18).toLocaleString()}</span>
            </div>
            
            {/* Divider */}
            <div className="border-t my-4"></div>
            
            {/* Total */}
            <div className="flex justify-between text-xl font-bold text-gray-800 mb-4">
              <span>Total</span>
              <span className="text-blue-600">
                Rs. {(totalPrice + totalPrice * 0.18).toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Proceed to Checkout →
            </Link>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="block text-center text-blue-500 mt-4 hover:text-blue-600 transition-colors duration-300 text-sm"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart