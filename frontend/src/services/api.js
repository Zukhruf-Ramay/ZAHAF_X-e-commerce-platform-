import axios from 'axios';

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth_logout'));
      
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH API
// ==========================================
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/auth/profile'),
  verifyOTP: (data) => api.post('/api/auth/verify-otp', data),
  resendOTP: (email) => api.post('/api/auth/resend-otp', { email }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  verifyResetOTP: (data) => api.post('/api/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// ==========================================
// CART API
// ==========================================
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (productId, quantity) => api.post('/api/cart/add', { productId, quantity }),
  removeFromCart: (productId) => api.delete(`/api/cart/remove/${productId}`),
  updateQuantity: (productId, quantity) => api.put(`/api/cart/update/${productId}`, { quantity }),
  clearCart: () => api.delete('/api/cart/clear'),
};

// ==========================================
// WISHLIST API
// ==========================================
export const wishlistAPI = {
  getWishlist: () => api.get('/api/wishlist'),
  addToWishlist: (productId) => api.post('/api/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/api/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete('/api/wishlist/clear'),
};

// ==========================================
// ORDERS API
// ==========================================
export const ordersAPI = {
  // User routes
  getOrders: () => api.get('/api/orders/myorders'),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  createOrder: (orderData) => api.post('/api/orders', orderData),
  cancelOrder: (id) => api.put(`/api/orders/${id}/cancel`),
  
  // Admin routes
  adminGetOrders: (status = 'all') => api.get(`/api/orders?status=${status}`),
  adminGetOrderById: (id) => api.get(`/api/orders/admin/${id}`),
  adminUpdateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  adminMarkDelivered: (id) => api.put(`/api/orders/${id}/deliver`),
  adminProcessRefund: (id) => api.post(`/api/orders/${id}/refund`),
};

// ==========================================
// PRODUCTS API
// ==========================================
export const productsAPI = {
  getProducts: () => api.get('/api/products'),
  getProductById: (id) => api.get(`/api/products/${id}`),
  getProductsByCategory: (category) => api.get(`/api/products?category=${category}`),
};

export default api;