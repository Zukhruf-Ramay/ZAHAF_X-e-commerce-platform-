import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    if (!user?.id) return
    try {
      console.log('Fetching cart for user:', user.id)

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          'X-Clerk-ID': user.id,
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
      console.log('Cart loaded:', items.length, 'items')
    } catch (err) {
      console.error('Failed to fetch cart:', err)
      toast.error('Failed to load cart')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isLoaded) return
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchCart()
      })
      return
    }
    if (!isSignedIn) {
      queueMicrotask(() => {
        setCartItems([])
        setLoading(false)
      })
    }
  }, [isLoaded, isSignedIn, user, fetchCart])

  const addToCart = async (product) => {
    if (!isSignedIn) {
      toast.error('Please login first!')
      return
    }
    
    try {
      console.log('Adding to cart:', product.name)
      
      await axios.post('http://localhost:5000/api/cart/add', 
        { productId: product._id, quantity: 1 },
        { 
          headers: { 
            'X-Clerk-ID': user?.id,
            'Content-Type': 'application/json'
          } 
        }
      )
      
      await fetchCart()
      toast.success(`${product.name} added to cart!`)
    } catch (err) {
      console.error('Add to cart error:', err)
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  const removeFromCart = async (id) => {
    try {
      console.log('Removing from cart:', id)
      
      await axios.delete(`http://localhost:5000/api/cart/remove/${id}`, {
        headers: { 
          'X-Clerk-ID': user?.id
        }
      })
      
      await fetchCart()
      toast.info('Removed from cart')
    } catch (err) {
      console.error('Remove error:', err)
      toast.error('Failed to remove')
    }
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return
    
    try {
      await axios.put(`http://localhost:5000/api/cart/update/${id}`,
        { quantity },
        { 
          headers: { 
            'X-Clerk-ID': user?.id
          } 
        }
      )
      await fetchCart()
    } catch (err) {
      console.error('Update quantity error:', err)
      toast.error('Failed to update quantity')
    }
  }

  const clearCart = async () => {
    try {
      console.log('Clearing cart for user:', user?.id)
      
      const response = await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { 'X-Clerk-ID': user?.id }
      })
      
      console.log('Clear cart response:', response.data)
      setCartItems([])
      toast.success('Cart cleared successfully!')
    } catch (err) {
      console.error('Clear cart error:', err)
      toast.error('Failed to clear cart')
    }
  }

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalPrice,
      loading
    }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook paired with provider
export const useCart = () => useContext(CartContext)