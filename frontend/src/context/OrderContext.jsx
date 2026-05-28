import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await ordersAPI.getOrders();
      setOrders(response.data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ✅ Add refreshOrders as an alias for fetchOrders
  const refreshOrders = useCallback(async () => {
    return fetchOrders();
  }, [fetchOrders]);

  const getOrderById = async (id) => {
    try {
      const response = await ordersAPI.getOrderById(id);
      return response.data;
    } catch (err) {
      console.error('Get order error:', err);
      toast.error('Failed to fetch order details');
      return null;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await ordersAPI.createOrder(orderData);
      await fetchOrders();
      toast.success('Order placed successfully!');
      return response.data;
    } catch (err) {
      console.error('Create order error:', err);
      toast.error(err.response?.data?.message || 'Failed to place order');
      throw err;
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await ordersAPI.cancelOrder(orderId);
      await fetchOrders();
      toast.success('Order cancelled successfully');
      return response.data;
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      error,
      fetchOrders,
      refreshOrders,  //  Added refreshOrders
      getOrderById,
      createOrder,
      cancelOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
};