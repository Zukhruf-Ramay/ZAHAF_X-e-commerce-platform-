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
    <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 relative">
      
      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110"
        aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <i className={`fas fa-heart transition-colors duration-300 ${isInWishlist(product._id) ? 'text-red-500' : 'text-gray-400'}`}></i>
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
            <i className="fas fa-check-circle mr-1"></i> In Stock
          </span>
        ) : (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
            <i className="fas fa-times-circle mr-1"></i> Out of Stock
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4">
        {/* Category with Icon */}
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <i className="fas fa-tag text-xs"></i>
          {product.category || 'Electronics'}
        </p>
        
        {/* ✅ FIXED: Product Name Link - Changed from /products/ to /product/ */}
        <Link to={`/product/${product._id}`}>
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
          {/* ✅ FIXED: Details Button Link - Changed from /products/ to /product/ */}
          <Link
            to={`/product/${product._id}`}
            className="flex-1 text-center border-2 border-blue-500 text-blue-500 py-1.5 sm:py-2 rounded-lg text-sm font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105"
          >
            <i className="fas fa-eye mr-1"></i> Details
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
                <i className="fas fa-check animate-bounce"></i> Added!
              </>
            ) : (
              <>
                <i className="fas fa-cart-plus"></i> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard