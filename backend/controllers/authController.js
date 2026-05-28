import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { 
  sendVerificationOTP, 
  sendWelcomeEmail,
  sendPasswordResetOTP 
} from '../utils/emailService.js';

// ==========================================
// Generate JWT Token
// ==========================================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ==========================================
// Generate 6-Digit OTP
// ==========================================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==========================================
// @desc    Register User - Send OTP
// ==========================================
export const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    email = email.toLowerCase().trim();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = new User({
      name,
      email,
      password,
      isVerified: false,
    });

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.lastVerificationEmailSent = Date.now();
    await user.save();

    const emailSent = await sendVerificationOTP(email, name, otp);

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Registration successful! OTP sent to your email.'
        : 'Account created but failed to send OTP.',
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// ==========================================
// @desc    Verify OTP
// ==========================================
export const verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase().trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({
      email,
      verificationToken: otp,
      verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified.',
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// ==========================================
// @desc    Resend OTP
// ==========================================
export const resendOTP = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified.',
      });
    }

    if (user.lastVerificationEmailSent && Date.now() - user.lastVerificationEmailSent < 60000) {
      const remainingSeconds = Math.ceil((60000 - (Date.now() - user.lastVerificationEmailSent)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
      });
    }

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationTokenExpiry = Date.now() + 10 * 60 * 1000;
    user.lastVerificationEmailSent = Date.now();
    await user.save();

    const emailSent = await sendVerificationOTP(user.email, user.name, otp);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully!',
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// ==========================================
// @desc    Login User
// ==========================================
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first.',
        needsVerification: true,
        email: user.email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ==========================================
// @desc    Get User Profile
// ==========================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// ==========================================
// @desc    Update User Profile
// ==========================================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = req.body.name || user.name;
    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// ==========================================
// @desc    Forgot Password - Send OTP
// ==========================================
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase().trim();

    console.log('🔍 Forgot password request for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found, but sending success response for security');
      return res.status(200).json({
        success: true,
        message: 'If an account exists, you will receive a password reset OTP.',
      });
    }

    const otp = generateOTP();
    console.log('Generated OTP:', otp, 'for user:', email);
    
    user.resetPasswordToken = otp;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log('Saved OTP to database');
    console.log('resetPasswordToken:', user.resetPasswordToken);
    console.log('resetPasswordExpiry:', user.resetPasswordExpiry);

    await sendPasswordResetOTP(email, user.name, otp);

    res.status(200).json({
      success: true,
      message: 'If an account exists, you will receive a password reset OTP.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// ==========================================
// @desc    Verify Reset OTP
// ==========================================
export const verifyResetOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase().trim();

    console.log('🔍 Verifying Reset OTP');
    console.log('Email:', email);
    console.log('OTP:', otp);

    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('User email:', user.email);
      console.log('Stored OTP:', user.resetPasswordToken);
      console.log('Expiry:', user.resetPasswordExpiry);
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.tempResetToken = resetToken;
    user.tempResetTokenExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// ==========================================
// @desc    Reset Password
// ==========================================
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findOne({
      tempResetToken: resetToken,
      tempResetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    user.tempResetToken = null;
    user.tempResetTokenExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully!',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};