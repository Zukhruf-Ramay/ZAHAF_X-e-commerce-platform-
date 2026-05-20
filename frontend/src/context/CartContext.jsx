import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user, token, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const API_URL = 'http://localhost:5000/api/cart'

  const fetchCart = useCallback(async () => {
    if (!user?._id || !token) {
      setLoading(false)
      return
    }
    
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const items = response.data.items?.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.mainImage || (item.product.images?.[0]) || item.product.image || 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image',
        category: item.product.category,
        stock: item.product.stock,
        quantity: item.quantity
      })) || []

      setCartItems(items)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
      if (err.response?.status === 401) {
        // Token expired or invalid
        setCartItems([])
      }
    } finally {
      setLoading(false)
    }
  }, [user?._id, token])

  useEffect(() => {
    if (authLoading) return
    if (user && token) {
      fetchCart()
    } else {
      setCartItems([])
      setLoading(false)
    }
  }, [authLoading, user, token, fetchCart])

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.error('Please login first!')
      return false
    }
    
    try {
      await axios.post(`${API_URL}/add`, 
        { productId: product._id, quantity: quantity },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      )
      
      await fetchCart()
      toast.success(`${product.name} added to cart!`)
      return true
    } catch (err) {
      console.error('Add to cart error:', err)
      toast.error(err.response?.data?.message || 'Failed to add to cart')
      return false
    }
  }

  const removeFromCart = async (id) => {
    try {
      await axios.delete(`${API_URL}/remove/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      await fetchCart()
      toast.info('Removed from cart')
      return true
    } catch (err) {
      console.error('Remove error:', err)
      toast.error('Failed to remove')
      return false
    }
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) {
      await removeFromCart(id)
      return
    }
    
    try {
      await axios.put(`${API_URL}/update/${id}`,
        { quantity },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`
          } 
        }
      )
      await fetchCart()
      return true
    } catch (err) {
      console.error('Update quantity error:', err)
      toast.error('Failed to update quantity')
      return false
    }
  }

  // ✅ Clear cart after successful payment
  const clearCart = async () => {
    try {
      // Clear from backend
      await axios.delete(`${API_URL}/clear`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      })
      // Clear local state
      setCartItems([])
      console.log('✅ Cart cleared successfully')
      return true
    } catch (err) {
      console.error('Clear cart error:', err)
      // Even if backend fails, clear local state
      setCartItems([])
      return false
    }
  }

  // ✅ Local clear cart (without API call) - for immediate UI update
  const clearLocalCart = () => {
    setCartItems([])
    console.log('✅ Local cart cleared')
  }

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      clearLocalCart,
      totalPrice,
      totalItems,
      loading,
      itemCount: cartItems.length
    }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook paired with provider
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}