import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('details')
  const { addToCart } = useCart()

  const getAllImages = useCallback(() => {
    if (product?.images && product.images.length > 0) {
      return product.images
    }
    if (product?.image) {
      return [product.image]
    }
    return ['https://via.placeholder.com/600x400?text=No+Image']
  }, [product])

  useEffect(() => {
    window.scrollTo(0, 0)
    axios.get(`http://localhost:5000/api/products/${id}`)
      .then(res => {
        setProduct(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  // ✅ Keyboard Navigation for Images (Left/Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!product) return
      
      const images = getAllImages()
      if (images.length <= 1) return
      
      if (e.key === 'ArrowLeft') {
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length)
        e.preventDefault()
      } else if (e.key === 'ArrowRight') {
        setSelectedImage((prev) => (prev + 1) % images.length)
        e.preventDefault()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product, getAllImages])

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const images = getAllImages()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Product not found!</h2>
        <Link to="/products" className="text-blue-500 mt-4 inline-block">Back to Products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">Home</Link> / 
        <Link to="/products" className="hover:text-blue-500 ml-1">Products</Link> / 
        <span className="text-gray-700 ml-1">{product.name}</span>
      </div>

      {/* Keyboard Navigation Hint */}
      {/* {images.length > 1 && (
        <div className="text-center text-sm text-gray-400 mb-4">
          💡 Use ← → arrow keys to navigate between images
        </div>
      )} */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden relative group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-contain p-4 transition-transform duration-500 hover:scale-105"
            />
            
            {/* Navigation Arrows Overlay (for visual feedback) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div className="text-center text-sm text-gray-500">
              Image {selectedImage + 1} of {images.length}
            </div>
          )}

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedImage === idx ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="space-y-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
              {product.category || 'Electronics'}
            </span>
            {product.stock > 0 ? (
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                {product.stock} in stock
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">Out of Stock</span>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Brand & Model */}
          {(product.brand || product.model) && (
            <div className="text-gray-500 text-sm">
              {product.brand && <span>Brand: {product.brand}</span>}
              {product.model && <span className="ml-4">Model: {product.model}</span>}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              ))}
            </div>
            <span className="text-gray-500 text-sm">({product.numReviews || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="border-t pt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-blue-600">Rs. {product.price?.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="text-gray-400 text-lg line-through">Rs. {product.oldPrice?.toLocaleString()}</span>
              )}
            </div>
            {product.oldPrice && (
              <p className="text-green-600 text-sm mt-1">You save Rs. {(product.oldPrice - product.price).toLocaleString()}</p>
            )}
          </div>

          {/* Description Preview */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Quantity:</span>
            <div className="flex items-center gap-3 border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
            <span className="text-gray-500 text-sm">Max {product.stock} units</span>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 ${
              product.stock === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transform hover:scale-105'
            }`}
          >
            {isAdded ? '✓ Added to Cart!' : `🛒 Add to Cart (${quantity})`}
          </button>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 pt-4 border-t">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free Shipping on orders over Rs. 50,000
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M6 18h6" />
              </svg>
              7-Day Easy Returns
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section - Specifications & Details */}
      <div className="mt-12">
        <div className="border-b flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'specs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'shipping' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Description</h3>
              <p className="text-gray-600">{product.description}</p>
              {product.features && (
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {product.features?.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.specifications?.processor && (
                  <div className="flex border-b py-2">
                    <span className="w-32 text-gray-500">Processor</span>
                    <span className="font-medium">{product.specifications.processor}</span>
                  </div>
                )}
                {product.specifications?.ram && (
                  <div className="flex border-b py-2">
                    <span className="w-32 text-gray-500">RAM</span>
                    <span className="font-medium">{product.specifications.ram}</span>
                  </div>
                )}
                {product.specifications?.storage && (
                  <div className="flex border-b py-2">
                    <span className="w-32 text-gray-500">Storage</span>
                    <span className="font-medium">{product.specifications.storage}</span>
                  </div>
                )}
                {product.specifications?.display && (
                  <div className="flex border-b py-2">
                    <span className="w-32 text-gray-500">Display</span>
                    <span className="font-medium">{product.specifications.display}</span>
                  </div>
                )}
                {product.specifications?.battery && (
                  <div className="flex border-b py-2">
                    <span className="w-32 text-gray-500">Battery</span>
                    <span className="font-medium">{product.specifications.battery}</span>
                  </div>
                )}
                {product.specifications?.camera && (
                  <div className="flex border-b py-2">
                    <span className="w-32 text-gray-500">Camera</span>
                    <span className="font-medium">{product.specifications.camera}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-gray-600">
              <p>• Free shipping on orders above Rs. 50,000</p>
              <p>• Delivery within 3-5 business days across Pakistan</p>
              <p>• Easy 7-day return policy</p>
              <p>• Cash on Delivery available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail