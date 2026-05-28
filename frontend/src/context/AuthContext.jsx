import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          console.error('Token validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Listen for auth logout events
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    
    window.addEventListener('auth_logout', handleLogout);
    return () => window.removeEventListener('auth_logout', handleLogout);
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      if (error.response?.data?.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          message,
          email,
        };
      }
      
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await authAPI.register({ name, email, password });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw { message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // ✅ ADDED: Update profile function
  const updateProfile = (updatedData) => {
    const updatedUser = updatedData.user || updatedData;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    updateProfile,  // ✅ ADDED
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};