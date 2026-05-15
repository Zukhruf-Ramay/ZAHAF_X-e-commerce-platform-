import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [addingId, setAddingId] = useState(null)

  const handleAddToCart = (item) => {
    setAddingId(item._id)
    addToCart(item)
    setTimeout(() => setAddingId(null), 1000)
  }

  // Helper function to get correct image URL
  const getProductImage = (item) => {
    if (item.mainImage) return item.mainImage
    if (item.image) return item.image
    if (item.images && item.images.length > 0) return item.images[0]
    return 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image'
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="text-7xl mb-4">❤️</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-6">Save your favorite items here!</p>
          <Link 
            to="/products"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition transform hover:scale-105"
          >
            🛍️ Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Wishlist</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
          <p className="text-gray-500 text-sm mt-1">{wishlistItems.length} items saved</p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-red-500 hover:text-red-600 text-sm transition"
        >
          Clear All
        </button>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item, index) => (
          <div 
            key={item._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative">
              {/* ✅ FIXED: Image with priority and error fallback */}
              <img
                src={getProductImage(item)}
                alt={item.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image'
                }}
              />
              <button
                onClick={() => removeFromWishlist(item._id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-red-50 transition-all duration-300"
              >
                <svg className="w-5 h-5 text-red-500" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-800 hover:text-blue-500 transition">
                <Link to={`/products/${item._id}`}>{item.name}</Link>
              </h3>
              <p className="text-gray-500 text-sm mt-1">{item.category}</p>
              <p className="text-blue-600 font-bold text-xl mt-2">Rs. {item.price?.toLocaleString()}</p>
              
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                {addingId === item._id ? 'Added! ✓' : '🛒 Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Wishlist