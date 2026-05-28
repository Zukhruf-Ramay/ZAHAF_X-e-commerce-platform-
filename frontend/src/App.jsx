import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/Home';
import ProductsPage from './pages/Products';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import OrderHistoryPage from './pages/OrderHistory';
import OrderDetailPage from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/Profile';
import WishlistPage from './pages/Wishlist';
import PaymentCancel from './pages/PaymentCancel';
import PaymentSuccess from './pages/PaymentSuccess';  // ✅ ADDED

// Policy Pages
import FAQ from './pages/FAQ';
import Returns from './pages/Returns';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Shipping from './pages/Shipping';

// OTP Verification Pages
import VerifyOTP from './pages/VerifyOTP';
import ResendOTP from './pages/ResendOTP';

// Password Reset Pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/ManageProducts';
import AdminOrders from './pages/admin/ManageOrders';
import AdminOrderDetail from './pages/admin/OrderDetail';

// Protected Routes
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <OrderProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow pt-16 md:pt-20">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    
                    {/* Policy Routes */}
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/shipping" element={<Shipping />} />
                    
                    {/* OTP Verification Routes */}
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/resend-otp" element={<ResendOTP />} />
                    
                    {/* Password Reset Routes */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Payment Routes */}
                    <Route path="/payment-cancel" element={<PaymentCancel />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />  {/* ✅ ADDED */}
                    
                    {/* Order Routes */}
                    <Route path="/cart" element={
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/order/:id" element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } />
                    <Route path="/admin/products" element={
                      <AdminRoute>
                        <AdminProducts />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders" element={
                      <AdminRoute>
                        <AdminOrders />
                      </AdminRoute>
                    } />
                    <Route path="/admin/orders/:id" element={
                      <AdminRoute>
                        <AdminOrderDetail />
                      </AdminRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
                <ToastContainer position="bottom-right" />
              </div>
            </OrderProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;