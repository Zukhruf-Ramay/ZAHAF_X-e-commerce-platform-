import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)
  const API_URL = 'http://localhost:5000/api/wishlist'

  const fetchWishlist = useCallback(async () => {
    if (!user?._id || !token) return
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const items = response.data.items?.map(product => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        stock: product.stock,
        image: product.mainImage || (product.images?.[0]) || product.image || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
        mainImage: product.mainImage,
        images: product.images
      })) || []

      setWishlistItems(items)
    } catch (err) {
      console.error('Failed to fetch wishlist', err)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }, [user?._id, token])

  useEffect(() => {
    if (authLoading) return
    if (user && token) {
      fetchWishlist()
    } else {
      setWishlistItems([])
      setLoading(false)
    }
  }, [authLoading, user, token, fetchWishlist])

  const addToWishlist = async (product) => {
    if (!user) {
      toast.error('Please login first!')
      return
    }
    try {
      await axios.post(`${API_URL}/add`,
        { productId: product._id },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      )
      await fetchWishlist()
      toast.success(`❤️ ${product.name} added to wishlist`)
    } catch (err) {
      console.error('Add to wishlist error:', err)
      toast.error('Failed to add to wishlist')
    }
  }

  const removeFromWishlist = async (id) => {
    try {
      await axios.delete(`${API_URL}/remove/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      await fetchWishlist()
      toast.info('Removed from wishlist')
    } catch (err) {
      console.error('Remove from wishlist error:', err)
      toast.error('Failed to remove')
    }
  }

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item._id === id)
  }

  const clearWishlist = async () => {
    try {
      await axios.delete(`${API_URL}/clear`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setWishlistItems([])
      toast.success('Wishlist cleared successfully!')
    } catch (err) {
      console.error('Clear wishlist error:', err)
      toast.error('Failed to clear wishlist')
    }
  }

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook paired with provider
export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}