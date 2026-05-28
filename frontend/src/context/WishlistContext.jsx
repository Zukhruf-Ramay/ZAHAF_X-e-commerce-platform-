import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }
    
    try {
      const response = await wishlistAPI.getWishlist();
      const items = response.data.items?.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        image: product.mainImage || (product.images?.[0]) || 'https://placehold.co/400x400',
      })) || [];
      
      setWishlistItems(items);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login first!');
      return false;
    }
    
    try {
      await wishlistAPI.addToWishlist(product._id);
      await fetchWishlist();
      toast.success(`❤️ ${product.name} added to wishlist`);
      return true;
    } catch (err) {
      console.error('Add to wishlist error:', err);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.removeFromWishlist(productId);
      await fetchWishlist();
      toast.info('Removed from wishlist');
      return true;
    } catch (err) {
      console.error('Remove from wishlist error:', err);
      toast.error('Failed to remove');
      return false;
    }
  };

  const clearWishlist = async () => {
    try {
      await wishlistAPI.clearWishlist();
      setWishlistItems([]);
      toast.success('Wishlist cleared!');
      return true;
    } catch (err) {
      console.error('Clear wishlist error:', err);
      toast.error('Failed to clear wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      loading,
      itemCount: wishlistItems.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};