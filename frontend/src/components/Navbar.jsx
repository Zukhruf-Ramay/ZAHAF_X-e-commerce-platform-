import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { cartItems } = useCart()
  const { wishlistItems } = useWishlist()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U'
  }

  // Animation classes
  const linkAnimation = "transition-all duration-300 hover:scale-105"
  const activeLinkClass = "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md"
  const inactiveLinkClass = "text-gray-600 hover:bg-gray-100"

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
        : 'bg-white shadow-md py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="group flex items-center space-x-2">
            <div className="relative">
              <span className="text-3xl transition-all duration-300 group-hover:scale-110 inline-block animate-pulse-slow">🎧</span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            </div>
            <div> 
              <span className="text-2xl sm:text-3xl font-black tracking-wider bg-gradient-to-r from-blue-800 via-indigo-800 to-indigo-950 bg-clip-text text-transparent drop-shadow-md">
                ZAHAF-X
              </span>
              <div className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 group-hover:w-full"></div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-lg text-sm font-medium ${linkAnimation} ${
                location.pathname === '/' ? activeLinkClass : inactiveLinkClass
              }`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`px-3 py-2 rounded-lg text-sm font-medium ${linkAnimation} ${
                location.pathname === '/products' ? activeLinkClass : inactiveLinkClass
              }`}
            >
              Products
            </Link>
            {user && (
              <>
                <Link 
                  to="/wishlist" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${linkAnimation} ${
                    location.pathname === '/wishlist' ? activeLinkClass : inactiveLinkClass
                  }`}
                >
                  Wishlist
                  {wishlistItems.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/orders" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${linkAnimation} ${
                    location.pathname === '/orders' ? activeLinkClass : inactiveLinkClass
                  }`}
                >
                  Orders
                </Link>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* ✅ Cart Icon - FIXED (uncommented) */}
            <Link to="/cart" className="relative group">
              <div className="p-2 rounded-full bg-gray-100 transition-all duration-300 group-hover:bg-gray-200 group-hover:scale-110">
                <i className="fas fa-shopping-cart text-gray-700"></i>
              </div>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-bounce">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-1 rounded-full transition-all duration-300 hover:scale-105 hover:bg-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 group-hover:shadow-xl">
                    {getUserInitial()}
                  </div>
                  <i className="fas fa-chevron-down text-gray-500 text-xs transition-transform duration-300 group-hover:rotate-180"></i>
                </button>
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  <div className="p-3 border-b bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-50">
                      <i className="fas fa-user w-4"></i> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-50">
                      <i className="fas fa-box w-4"></i> My Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-all duration-300 hover:bg-gray-50">
                      <i className="fas fa-heart w-4"></i> Wishlist
                      {wishlistItems.length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {wishlistItems.length}
                        </span>
                      )}
                    </Link>
                    {isAdmin && (
                      <>
                        <hr className="my-1" />
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2 text-sm text-purple-600 transition-all duration-300 hover:bg-purple-50">
                          <i className="fas fa-cog w-4"></i> Admin Panel
                        </Link>
                      </>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 transition-all duration-300 hover:bg-red-50">
                      <i className="fas fa-sign-out-alt w-4"></i> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:text-blue-600 hover:scale-105">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-md">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/cart" className="relative group">
              <div className="p-2 rounded-full bg-gray-100 transition-all duration-300 group-hover:bg-gray-200 group-hover:scale-110">
                <i className="fas fa-shopping-cart text-gray-700"></i>
              </div>
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-bounce">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-gray-700 text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-2 pb-4 space-y-2 border-t border-gray-100">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-home w-5 mr-2"></i> Home
            </Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-50 rounded-lg">
              <i className="fas fa-shopping-bag w-5 mr-2"></i> Products
            </Link>
            
            {user ? (
              <>
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-50 rounded-lg">
                  <i className="fas fa-heart w-5 mr-2"></i> Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </Link>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-50 rounded-lg">
                  <i className="fas fa-box w-5 mr-2"></i> Orders
                </Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-50 rounded-lg">
                  <i className="fas fa-user w-5 mr-2"></i> Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-purple-600 transition-all duration-300 hover:bg-purple-50 rounded-lg">
                    <i className="fas fa-cog w-5 mr-2"></i> Admin Panel
                  </Link>
                )}
                <hr className="my-2" />
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 transition-all duration-300 hover:bg-red-50 rounded-lg">
                  <i className="fas fa-sign-out-alt w-5 mr-2"></i> Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center px-4 py-2 text-gray-700 transition-all duration-300 hover:bg-gray-50 rounded-lg">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg transition-all duration-300">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar