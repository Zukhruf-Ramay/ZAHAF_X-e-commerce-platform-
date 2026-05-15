import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useState } from 'react'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isAdded, setIsAdded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative">
      
      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110"
        aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg 
          className="w-5 h-5 transition-colors duration-300" 
          fill={isInWishlist(product._id) ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ color: isInWishlist(product._id) ? '#ef4444' : '#9ca3af' }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>

      {/* Image Section with Zoom Effect */}
      <div className="relative overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        <img
         src={product.mainImage || (product.images?.[0]) || product.image || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className={`w-full h-48 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Stock Status Badge */}
        {product.stock > 0 ? (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            ✓ In Stock
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            ✗ Out of Stock
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        {/* Category with Icon */}
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          {product.category || 'Electronics'}
        </p>
        
        {/* Product Name with Link Hover */}
        <Link to={`/products/${product._id}`}>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-2 hover:text-blue-500 transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-blue-600 font-bold text-lg sm:text-xl">
            Rs. {product.price.toLocaleString()}
          </span>
          <span className="text-gray-400 text-xs line-through">
            Rs. {(product.price * 1.1).toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 text-center border-2 border-blue-500 text-blue-500 py-1.5 sm:py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105"
          >
            View Details
          </Link>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-1.5 sm:py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              product.stock === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-lg'
            }`}
          >
            {isAdded ? (
              <>
                <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard