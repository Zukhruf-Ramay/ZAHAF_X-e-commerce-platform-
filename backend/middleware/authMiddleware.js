import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  let token;

  console.log('🔐 Auth Middleware - Headers:', req.headers.authorization ? 'Has token' : 'No token');

  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token received, length:', token.length);
      console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified, User ID:', decoded.id);

      // Get user from token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('✅ Auth successful for:', req.user.email);
      next();
    } catch (error) {
      console.error('❌ Auth error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }
};

// Admin middleware - check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};