import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import OrderSuccess from './pages/OrderSuccess'
import Wishlist from './pages/Wishlist'
import OrderHistory from './pages/OrderHistory'
import OrderDetail from './pages/OrderDetail' // User order detail
import Profile from './pages/Profile'
import VerifyEmailPage from './pages/VerifyEmailPage'
import EmailVerificationPage from './pages/EmailVerificationPage'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import ManageProducts from './pages/admin/ManageProducts'
import ManageOrders from './pages/admin/ManageOrders'
import AdminOrderDetail from './pages/admin/OrderDetail' // Admin order detail

// Policy Pages
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import FAQ from './pages/FAQ'

// Stripe for payment integration
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main className="pt-20 min-h-screen">
            <Routes>
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />
                            
              {/* Auth Error Route */}
              <Route 
                path="/auth-error" 
                element={
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Authentication Error</h2>
                    <p className="text-gray-600 mb-6">Please try logging in again.</p>
                    <Link 
                      to="/login" 
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Back to Login
                    </Link>
                  </div>
                } 
              />
              
              {/* ========== PUBLIC ROUTES ========== */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
              
              {/* ========== PROTECTED ROUTES (USERS) ========== */}
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/order-success" element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } />
              
              {/* ✅ User Order Detail - uses OrderDetail component */}
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* ========== ADMIN ROUTES ========== */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute adminOnly={true}>
                  <ManageProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute adminOnly={true}>
                  <ManageOrders />
                </ProtectedRoute>
              } />
              
              {/* ✅ Admin Order Detail - uses AdminOrderDetail component */}
              <Route path="/admin/orders/:id" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminOrderDetail />
                </ProtectedRoute>
              } />
              
              {/* ========== POLICY ROUTES ========== */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  )
}

export default App