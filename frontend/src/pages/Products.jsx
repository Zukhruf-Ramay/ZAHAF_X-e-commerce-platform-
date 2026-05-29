import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // ✅ ADDED: API_URL for production compatibility
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // ✅ FIXED: Use API_URL
    axios.get(`${API_URL}/api/products`)
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching products:', err)
        setLoading(false)
      })
  }, [API_URL])

  const filtered = products.filter(p => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    
    // Category filter
    const matchesCategory = category === '' || p.category === category
    
    // Price range filter
    let matchesPrice = true
    if (priceRange === 'under-50000') matchesPrice = p.price < 50000
    else if (priceRange === '50000-100000') matchesPrice = p.price >= 50000 && p.price <= 100000
    else if (priceRange === '100000-200000') matchesPrice = p.price >= 100000 && p.price <= 200000
    else if (priceRange === 'above-200000') matchesPrice = p.price > 200000
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setPriceRange('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          All Products
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          {filtered.length} products found
        </p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="md:hidden w-full mb-4 bg-gray-100 px-4 py-2 rounded-lg flex items-center justify-between hover:bg-gray-200 transition-all duration-300"
      >
        <span className="font-semibold">🔍 Filters & Search</span>
        <svg className={`w-5 h-5 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Section - Responsive */}
      <div className={`md:grid md:grid-cols-4 gap-6 mb-8 transition-all duration-300 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        {/* Search Bar */}
        <div className="mb-4 md:mb-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">🔍 Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 pl-10"
            />
            <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-4 md:mb-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">📁 Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 bg-white"
          >
            <option value="">All Categories</option>
            {categories.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="mb-4 md:mb-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">💰 Price Range</label>
          <select
            value={priceRange}
            onChange={e => setPriceRange(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 bg-white"
          >
            <option value="">All Prices</option>
            <option value="under-50000">Under Rs. 50,000</option>
            <option value="50000-100000">Rs. 50,000 - 1,00,000</option>
            <option value="100000-200000">Rs. 1,00,000 - 2,00,000</option>
            <option value="above-200000">Above Rs. 2,00,000</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg transition-all duration-300 font-semibold"
          >
            ✖ Clear All Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(search || category || priceRange) && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
          <span className="text-sm text-gray-600">Active filters:</span>
          {search && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Search: {search}
              <button onClick={() => setSearch('')} className="hover:text-blue-900">×</button>
            </span>
          )}
          {category && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {category}
              <button onClick={() => setCategory('')} className="hover:text-green-900">×</button>
            </span>
          )}
          {priceRange && (
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {priceRange === 'under-50000' && 'Under Rs. 50,000'}
              {priceRange === '50000-100000' && 'Rs. 50,000 - 1,00,000'}
              {priceRange === '100000-200000' && 'Rs. 1,00,000 - 2,00,000'}
              {priceRange === 'above-200000' && 'Above Rs. 2,00,000'}
              <button onClick={() => setPriceRange('')} className="hover:text-purple-900">×</button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid with Skeleton Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2 mb-2"></div>
              <div className="bg-gray-200 h-8 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 sm:py-16 animate-fade-in">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found!</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={clearFilters}
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            Clear all filters →
          </button>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {filtered.map((product, index) => (
              <div 
                key={product._id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mt-8 sm:mt-10 text-gray-500 text-sm">
            Showing {filtered.length} of {products.length} products
          </div>
        </>
      )}
    </div>
  )
}

export default Products