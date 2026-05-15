import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'



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
import OrderSuccess from './pages/OrderSuccess'
import Wishlist from './pages/Wishlist'
import OrderHistory from './pages/OrderHistory'
import Profile from './pages/Profile'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import ManageProducts from './pages/admin/ManageProducts'
import ManageOrders from './pages/admin/ManageOrders'
import OrderDetail from './pages/admin/OrderDetail'

// Policy Pages
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import FAQ from './pages/FAQ'

function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          {/* Add padding-top to push content below fixed navbar */}
          <main className="pt-16 md:pt-20">
            <Routes>

              <Route 
  path="/sign-in/sso-callback" 
  element={<AuthenticateWithRedirectCallback />} 
/>
<Route 
  path="/login/sso-callback" 
  element={<AuthenticateWithRedirectCallback />} 
/>
<Route 
  path="/register/verify-email" 
  element={<AuthenticateWithRedirectCallback />} 
/>
<Route 
  path="/register/verify-email/*" 
  element={<AuthenticateWithRedirectCallback />} 
/>

// Also add a catch-all error route
        <Route 
          path="/auth-error" 
          element={
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
              <p className="mt-4">Please try logging in again.</p>
              <a href="/login" className="mt-4 inline-block text-blue-500">Back to Login</a>
            </div>
          } 
        />
                  <Route 
                    path="/login/sso-callback" 
                    element={<AuthenticateWithRedirectCallback />} 
                  />
                  <Route 
  path="/register/verify-email" 
  element={<AuthenticateWithRedirectCallback />} 
/>
<Route 
  path="/register/verify-email/*" 
  element={<AuthenticateWithRedirectCallback />} 
/>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/checkout" element={
                <ProtectedRoute><Checkout /></ProtectedRoute>
              } />
              <Route path="/order-success" element={
                <ProtectedRoute><OrderSuccess /></ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute><Wishlist /></ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute><OrderHistory /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}><Dashboard /></ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute adminOnly={true}><ManageProducts /></ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute adminOnly={true}><ManageOrders /></ProtectedRoute>
              } />
              <Route path="/admin/orders/:id" element={
                <ProtectedRoute adminOnly={true}><OrderDetail /></ProtectedRoute>
              } />
              
              {/* Policy Routes */}
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