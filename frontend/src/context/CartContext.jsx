import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrderId, setPendingOrderId] = useState(localStorage.getItem('pendingOrderId') || null);
  
  // ✅ Add lock to prevent duplicate requests
  const addToCartLock = useRef(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    
    try {
      const response = await cartAPI.getCart();
      const items = response.data.items?.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.mainImage || (item.product.images?.[0]) || 'https://placehold.co/400x400',
        category: item.product.category,
        stock: item.product.stock,
        quantity: item.quantity
      })) || [];
      
      setCartItems(items);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login first!');
      return false;
    }
    
    // ✅ Prevent multiple rapid clicks
    if (addToCartLock.current) {
      return false;
    }
    
    addToCartLock.current = true;
    
    try {
      await cartAPI.addToCart(product._id, quantity);
      await fetchCart();
      
      if (pendingOrderId) {
        console.log('Adding to existing pending order:', pendingOrderId);
      }
      
      toast.success(`${product.name} added to cart!`);
      return true;
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    } finally {
      setTimeout(() => {
        addToCartLock.current = false;
      }, 500);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await fetchCart();
      toast.info('Removed from cart');
      return true;
    } catch (err) {
      console.error('Remove error:', err);
      toast.error('Failed to remove');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    
    try {
      await cartAPI.updateQuantity(productId, quantity);
      await fetchCart();
      return true;
    } catch (err) {
      console.error('Update quantity error:', err);
      toast.error('Failed to update quantity');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      toast.success('Cart cleared');
      return true;
    } catch (err) {
      console.error('Clear cart error:', err);
      setCartItems([]);
      return false;
    }
  };

  const clearPendingOrder = () => {
    localStorage.removeItem('pendingOrderId');
    setPendingOrderId(null);
  };

  const setPendingOrder = (orderId) => {
    localStorage.setItem('pendingOrderId', orderId);
    setPendingOrderId(orderId);
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      clearPendingOrder,
      setPendingOrder,
      pendingOrderId,
      totalPrice,
      totalItems,
      loading,
      itemCount: cartItems.length
    }}>
      {children}
    </CartContext.Provider>
  );
};