import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,      // ✅ ADD THIS
  verifyOTP,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

// OTP Verification
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// ==========================================
// PROTECTED ROUTES (Authentication required)
// ==========================================

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);  // ✅ ADD THIS

export default router;