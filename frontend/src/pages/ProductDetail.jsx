import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('details')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImage, setModalImage] = useState('')
  const { addToCart } = useCart()

  // ✅ FIXED: Use environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const getAllImages = useCallback(() => {
    if (product?.images && product.images.length > 0) {
      return product.images
    }
    if (product?.mainImage) {
      return [product.mainImage]
    }
    if (product?.image) {
      return [product.image]
    }
    return ['https://via.placeholder.com/600x400?text=No+Image']
  }, [product])

  useEffect(() => {
    window.scrollTo(0, 0)
    
    // ✅ FIXED: Better error handling and response parsing
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching product ID:', id)
        console.log('API URL:', `${API_URL}/api/products/${id}`)
        
        const res = await axios.get(`${API_URL}/api/products/${id}`)
        
        console.log('API Response:', res.data)
        
        // ✅ FIXED: Handle different response structures
        let productData = null
        if (res.data.product) {
          productData = res.data.product
        } else if (res.data.data) {
          productData = res.data.data
        } else {
          productData = res.data
        }
        
        if (productData && productData._id) {
          setProduct(productData)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        console.error('Error response:', err.response)
        
        if (err.response?.status === 404) {
          setError('Product not found')
        } else {
          setError(err.response?.data?.message || 'Failed to load product')
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchProduct()
    } else {
      setError('No product ID provided')
      setLoading(false)
    }
  }, [id, API_URL])

  // Keyboard Navigation for Images
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
      } else if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product, getAllImages, isImageModalOpen])

  // ✅ FIXED: Pass quantity directly instead of looping
  const handleAddToCart = () => {
    if (!product) return
    
    addToCart(product, quantity)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl)
    setIsImageModalOpen(true)
  }

  const images = getAllImages()

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-red-50 p-8 rounded-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/products" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 inline-block">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  // ✅ Product not found state
  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Product not found!</h2>
          <Link to="/products" className="text-blue-500 mt-4 inline-block">Back to Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Image Zoom Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={() => setIsImageModalOpen(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition">&times;</button>
          <img src={modalImage} alt="Zoomed view" className="max-w-[90vw] max-h-[90vh] object-contain" />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">Home</Link> / 
        <Link to="/products" className="hover:text-blue-500 ml-1">Products</Link> / 
        <span className="text-gray-700 ml-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-100 rounded-2xl overflow-hidden relative group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-contain p-4 transition-transform duration-500 hover:scale-105 cursor-pointer"
              onClick={() => handleImageClick(images[selectedImage])}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'
              }}
            />
            
            {/* Zoom Icon */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" onClick={() => handleImageClick(images[selectedImage])}>
              <i className="fas fa-search-plus"></i>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 transform translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev + 1) % images.length)}
                  className="absolute right-2 top-1/2 transform translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
                >
                  <i className="fas fa-chevron-right"></i>
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
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'
                    }}
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
              <i className="fas fa-tag mr-1"></i> {product.category || 'Electronics'}
            </span>
            {product.stock > 0 ? (
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                <i className="fas fa-check-circle mr-1"></i> {product.stock} in stock
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">
                <i className="fas fa-times-circle mr-1"></i> Out of Stock
              </span>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>

          {/* Brand & Model */}
          {(product.brand || product.model) && (
            <div className="text-gray-500 text-sm">
              {product.brand && <><i className="fas fa-building mr-1"></i> Brand: {product.brand}</>}
              {product.model && <span className="ml-4"><i className="fas fa-barcode mr-1"></i> Model: {product.model}</span>}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
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
              <p className="text-green-600 text-sm mt-1"><i className="fas fa-save mr-1"></i> You save Rs. {(product.oldPrice - product.price).toLocaleString()}</p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700"><i className="fas fa-cubes mr-1"></i> Quantity:</span>
              <div className="flex items-center gap-3 border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <span className="text-gray-500 text-sm">Max {product.stock} units</span>
            </div>
          )}

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
            {isAdded ? (
              <><i className="fas fa-check mr-2"></i> Added to Cart!</>
            ) : (
              <><i className="fas fa-cart-plus mr-2"></i> Add to Cart ({quantity})</>
            )}
          </button>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 pt-4 border-t">
            <div className="flex items-center gap-2">
              <i className="fas fa-truck text-green-600"></i>
              Free Shipping on orders over Rs. 50,000
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-undo-alt text-green-600"></i>
              7-Day Easy Returns
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12">
        <div className="border-b flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            <i className="fas fa-info-circle mr-1"></i> Product Details
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'specs' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            <i className="fas fa-microchip mr-1"></i> Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 px-2 font-semibold transition-colors ${activeTab === 'shipping' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            <i className="fas fa-shipping-fast mr-1"></i> Shipping & Returns
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product Description</h3>
              <p className="text-gray-600">{product.description}</p>
              {product.features && product.features.length > 0 && (
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {product.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'specs' && product.specifications && (
            <div>
              <h3 className="font-semibold text-lg mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex border-b py-2">
                    <span className="w-32 text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-gray-600">
              <p><i className="fas fa-check-circle text-green-500 mr-2"></i> Free shipping on orders above Rs. 50,000</p>
              <p><i className="fas fa-truck mr-2"></i> Delivery within 3-5 business days across Pakistan</p>
              <p><i className="fas fa-undo-alt mr-2"></i> Easy 7-day return policy</p>
              <p><i className="fas fa-money-bill-wave mr-2"></i> Cash on Delivery available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail