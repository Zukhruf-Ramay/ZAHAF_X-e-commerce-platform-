import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    if (!user?.id) return
    try {
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: {
          'X-Clerk-ID': user.id,
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
      console.log('Wishlist loaded:', items.length, 'items')
    } catch (err) {
      console.error('Failed to fetch wishlist', err)
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchWishlist()
      })
      return
    }
    if (!isSignedIn) {
      queueMicrotask(() => {
        setWishlistItems([])
        setLoading(false)
      })
    }
  }, [isLoaded, isSignedIn, user, fetchWishlist])

  const addToWishlist = async (product) => {
    if (!isSignedIn) {
      toast.error('Please login first!')
      return
    }
    try {
      await axios.post('http://localhost:5000/api/wishlist/add',
        { productId: product._id },
        { 
          headers: { 
            'X-Clerk-ID': user?.id,
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
      await axios.delete(`http://localhost:5000/api/wishlist/remove/${id}`, {
        headers: { 
          'X-Clerk-ID': user?.id
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
      await axios.delete('http://localhost:5000/api/wishlist/clear', {
        headers: { 'X-Clerk-ID': user?.id }
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