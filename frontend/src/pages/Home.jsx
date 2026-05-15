import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { Link } from 'react-router-dom'

const HERO_SLIDES = [
    {
      title: "Premium Electronics",
      subtitle: "Discover the latest technology at unbeatable prices",
      buttonText: "Shop Now",
      buttonLink: "/products",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop",
      gradient: "from-slate-900/70 via-blue-900/60 to-indigo-900/70"
    },
    {
      title: "Smartphones & Tablets",
      subtitle: "Latest models from Apple, Samsung, Google & more",
      buttonText: "Explore Mobiles",
      buttonLink: "/products?category=Mobiles",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=600&fit=crop",
      gradient: "from-slate-900/70 via-blue-800/60 to-indigo-950/70"
    },
    {
      title: "Premium Accessories",
      subtitle: "Complete your setup with high-quality accessories",
      buttonText: "Shop Accessories",
      buttonLink: "/products?category=Accessories",
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&h=600&fit=crop",
      gradient: "from-slate-900/70 via-indigo-900/60 to-blue-950/70"
    }
]

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setProducts(res.data.slice(0, 8))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentHero = HERO_SLIDES[currentSlide]

  return (
    <div className="overflow-x-hidden">
      {/* Premium Hero Section - Professional Blue Theme */}
      <div className="relative h-screen min-h-[600px] max-h-[800px] overflow-hidden">
        
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <div 
            className="w-full h-full bg-cover bg-center transition-all duration-1000"
            style={{ 
              backgroundImage: `url(${currentHero.image})`,
            }}
          />
          {/* Gradient Overlay - Increased Transparency */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentHero.gradient} opacity-60`} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Slide Indicator - Minimal Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-500 rounded-full ${
                    currentSlide === index 
                      ? 'w-10 h-1 bg-white' 
                      : 'w-6 h-1 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Animated Title - Blue Gradient */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
              <span className="bg-gradient-to-r from-blue-200 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                {currentHero.title}
              </span>
            </h1>

            {/* Subtitle - More transparent */}
            <p className="text-blue-100/80 text-base sm:text-lg md:text-xl mb-10 max-w-2xl mx-auto px-4 animate-fade-in-up animation-delay-150">
              {currentHero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in-up animation-delay-300">
             <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="relative z-10">{currentHero.buttonText}</span>
                <svg className="relative z-10 w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-700/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              {/* <Link
                to="/products"
                className="inline-flex items-center justify-center px-8 py-3.5 font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
              >
                View All Products
              </Link> */}
            </div>

            {/* Trust Badges - More transparent */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up animation-delay-450">
              <div className="flex items-center gap-2 text-blue-100/70 text-sm">
                <svg className="w-5 h-5 text-blue-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free Shipping
              </div>
              <div className="flex items-center gap-2 text-blue-100/70 text-sm">
                <svg className="w-5 h-5 text-blue-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Payments
              </div>
              <div className="flex items-center gap-2 text-blue-100/70 text-sm">
                <svg className="w-5 h-5 text-blue-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M6 18h6" />
                </svg>
                7-Day Returns
              </div>
              <div className="flex items-center gap-2 text-blue-100/70 text-sm">
                <svg className="w-5 h-5 text-blue-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                24/7 Support
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border border-white/20 rounded-full flex justify-center">
            <div className="w-0.5 h-2 bg-white/30 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Featured Products
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
          <p className="text-gray-500 mt-4 text-sm sm:text-base">Handpicked just for you</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No products yet!</p>
            <Link
              to="/admin/products"
              className="inline-block mt-4 text-blue-500 hover:text-blue-600 transition-colors"
            >
              Add some products →
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-7">
              {products.map((product, index) => (
                <div 
                  key={product._id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12 sm:mt-16">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3 font-semibold text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 group"
              >
                <span>View All Products</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Home