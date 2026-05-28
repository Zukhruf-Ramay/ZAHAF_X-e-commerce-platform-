import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug log (remove in production)
console.log('📧 Email Service Initialized');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Loaded' : '❌ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email transporter ready');
  }
});

// ==========================================
// 1. Send OTP Verification Email
// ==========================================
export const sendVerificationOTP = async (email, name, otp) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - ZAHAF-X',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
          <p style="color: #6B7280; margin: 5px 0;">Premium Electronics</p>
        </div>
        
        <h2 style="color: #333;">Welcome to ZAHAF-X, ${name}! 👋</h2>
        
        <p>Thank you for registering with us. Please use the OTP below to verify your email address:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                      background-color: #f4f4f4; padding: 20px; border-radius: 10px;
                      font-family: monospace; display: inline-block;">
            ${otp}
          </div>
        </div>
        
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>🔒 Security Tip:</strong> Never share this OTP with anyone. ZAHAF-X will never ask for this code outside of the verification page.
          </p>
        </div>
        
        <p>If you didn't create an account with ZAHAF-X, please ignore this email.</p>
        
        <hr style="margin: 20px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ OTP sending error:', error.message);
    return false;
  }
};

// ==========================================
// 2. Send Welcome Email (After OTP Verification)
// ==========================================
export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to ZAHAF-X - Email Verified! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
          <p style="color: #6B7280; margin: 5px 0;">Premium Electronics</p>
        </div>
        
        <h2 style="color: #333;">Welcome to ZAHAF-X, ${name}! 🎉</h2>
        
        <p>Your email has been successfully verified. You can now:</p>
        
        <ul>
          <li>✅ Login to your account</li>
          <li>✅ Browse our amazing electronics</li>
          <li>✅ Add items to cart and wishlist</li>
          <li>✅ Place orders securely</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Login Now
          </a>
        </div>
        
        <p>Happy Shopping! 🛍️</p>
        
        <p style="margin-top: 30px;">- Team ZAHAF-X</p>
        
        <hr style="margin: 20px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          Need help? Contact us at ${process.env.EMAIL_USER}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return false;
  }
};

// ==========================================
// 3. Send Order Confirmation Email
// ==========================================
export const sendOrderConfirmation = async (email, name, orderId, totalAmount) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
        </div>
        
        <h2 style="color: #333;">Thank you for your order, ${name}! 🛍️</h2>
        
        <p>Your order has been placed successfully.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
          <p><strong>Status:</strong> Confirmed ✅</p>
        </div>
        
        <p>We'll notify you once your order is shipped.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/orders" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Order
          </a>
        </div>
        
        <p>Thank you for shopping with ZAHAF-X!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Order confirmation error:', error.message);
    return false;
  }
};

// ==========================================
// 4. Send Payment Confirmation Email
// ==========================================
export const sendPaymentConfirmation = async (email, name, orderId, amount, paymentMethod) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payment Confirmation - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
        </div>
        
        <h2 style="color: #333;">Payment Received! ✅</h2>
        
        <p>Dear ${name},</p>
        
        <p>We have successfully received your payment for order #${orderId}.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Amount Paid:</strong> ₹${amount.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        </div>
        
        <p>Your order will be processed soon.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/order/${orderId}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            View Order Details
          </a>
        </div>
        
        <p>Thank you for shopping with ZAHAF-X!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Payment confirmation error:', error.message);
    return false;
  }
};

// ==========================================
// 5. Send Password Reset OTP (OTP-Based)
// ==========================================
export const sendPasswordResetOTP = async (email, name, otp) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP - ZAHAF-X',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
          <p style="color: #6B7280; margin: 5px 0;">Password Reset Request</p>
        </div>
        
        <h2 style="color: #333;">Password Reset OTP 🔐</h2>
        
        <p>Dear ${name},</p>
        
        <p>We received a request to reset your password. Use the OTP below to continue:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; 
                      background-color: #f4f4f4; padding: 20px; border-radius: 10px;
                      font-family: monospace; display: inline-block;">
            ${otp}
          </div>
        </div>
        
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>🔒 Security Tip:</strong> Never share this OTP with anyone. ZAHAF-X will never ask for this code outside of the verification page.
          </p>
        </div>
        
        <p>If you didn't request this, please ignore this email.</p>
        
        <hr style="margin: 20px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Password reset OTP error:', error.message);
    return false;
  }
};

// ==========================================
// 6. Send Order Status Update Email
// ==========================================
export const sendOrderStatusUpdate = async (email, name, orderId, status) => {
  const statusMessages = {
    'processing': 'Your order is being processed and will be shipped soon.',
    'shipped': 'Your order has been shipped and is on its way!',
    'delivered': 'Your order has been delivered. Enjoy your purchase!',
    'cancelled': 'Your order has been cancelled as requested.'
  };

  const statusColors = {
    'processing': '#F59E0B',
    'shipped': '#3B82F6',
    'delivered': '#10B981',
    'cancelled': '#EF4444'
  };

  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Status Update - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
        </div>
        
        <h2 style="color: #333;">Order Status Update 📦</h2>
        
        <p>Dear ${name},</p>
        
        <p>Your order <strong>#${orderId}</strong> status has been updated to:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <span style="background-color: ${statusColors[status]}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold;">
            ${status.toUpperCase()}
          </span>
        </div>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">${statusMessages[status] || 'Your order status has been updated.'}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/order/${orderId}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Order
          </a>
        </div>
        
        <p>Thank you for shopping with ZAHAF-X!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order status update sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Order status update error:', error.message);
    return false;
  }
};

// ==========================================
// 7. Send Refund Confirmation Email
// ==========================================
export const sendRefundConfirmation = async (email, name, orderId, amount) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Refund Confirmation - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">ZAHAF-X</h1>
        </div>
        
        <h2 style="color: #333;">Refund Processed 💰</h2>
        
        <p>Dear ${name},</p>
        
        <p>Your refund for order <strong>#${orderId}</strong> has been processed successfully.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Refund Amount:</strong> ₹${amount.toLocaleString()}</p>
        </div>
        
        <p>The amount will be credited to your original payment method within <strong>5-7 business days</strong>.</p>
        
        <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #0369a1;">
            💡 If you have any questions, please contact our support team.
          </p>
        </div>
        
        <p>Thank you for shopping with ZAHAF-X!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Refund confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Refund confirmation error:', error.message);
    return false;
  }
};