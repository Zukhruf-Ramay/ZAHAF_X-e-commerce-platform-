import { Resend } from 'resend';
import config from '../config/index.js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification OTP
export const sendVerificationOTP = async (email, name, otp) => {
  const verificationUrl = `${config.frontendUrl}/verify-otp?email=${encodeURIComponent(email)}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">ZAHAF X</h2>
      <h3 style="text-align: center;">Email Verification</h3>
      <p>Dear ${name},</p>
      <p>Welcome to ZAHAF X! Please verify your email address using the OTP below:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>Or click the button below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">This OTP expires in 10 minutes.</p>
      <p style="font-size: 12px; color: #9ca3af;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZAHAF X <noreply@zahafx.com>',
      to: [email],
      subject: 'Verify Your Email - ZAHAF X',
      html: html,
    });

    if (error) throw error;
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ OTP error:', error.message);
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Welcome to ZAHAF X! 🎉</h2>
      <p>Dear ${name},</p>
      <p>Thank you for verifying your email! Your account is now fully activated.</p>
      <p>You can now:</p>
      <ul>
        <li>Login to your account</li>
        <li>Browse our amazing electronics</li>
        <li>Add items to cart and wishlist</li>
        <li>Place orders</li>
      </ul>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${config.frontendUrl}/login" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Login Now
        </a>
      </div>
      <p>Happy Shopping! 🛍️</p>
      <p>- Team ZAHAF X</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZAHAF X <welcome@zahafx.com>',
      to: [email],
      subject: 'Welcome to ZAHAF X - Email Verified! 🎉',
      html: html,
    });

    if (error) throw error;
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email error:', error.message);
    return false;
  }
};

// Send password reset OTP
export const sendPasswordResetOTP = async (email, name, otp) => {
  const resetUrl = `${config.frontendUrl}/reset-password?email=${encodeURIComponent(email)}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">ZAHAF X</h2>
      <h3 style="text-align: center;">Password Reset Request</h3>
      <p>Dear ${name},</p>
      <p>We received a request to reset your password. Use the OTP below:</p>
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>Or click the button below:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">This OTP expires in 10 minutes.</p>
      <p style="font-size: 12px; color: #9ca3af;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZAHAF X <noreply@zahafx.com>',
      to: [email],
      subject: 'Password Reset OTP - ZAHAF X',
      html: html,
    });

    if (error) throw error;
    console.log(`✅ Password reset OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Password reset OTP error:', error.message);
    return false;
  }
};

// Send order confirmation email
export const sendOrderConfirmation = async (email, name, orderId, totalAmount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">ZAHAF X</h2>
      <h3 style="text-align: center;">Order Confirmation ✅</h3>
      <p>Dear ${name},</p>
      <p>Thank you for your order! Your order has been placed successfully.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Order ID:</strong> #${orderId.slice(-8)}</p>
        <p><strong>Total Amount:</strong> Rs. ${totalAmount.toLocaleString()}</p>
      </div>
      <p>We'll notify you once your order is shipped.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${config.frontendUrl}/orders" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View My Orders
        </a>
      </div>
      <p>Thank you for shopping with us!</p>
      <p>- Team ZAHAF X</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZAHAF X <orders@zahafx.com>',
      to: [email],
      subject: `Order Confirmation - #${orderId.slice(-8)}`,
      html: html,
    });

    if (error) throw error;
    console.log(`✅ Order confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Order confirmation error:', error.message);
    return false;
  }
};

// Send payment confirmation email
export const sendPaymentConfirmation = async (email, name, orderId, amount, paymentMethod) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">ZAHAF X</h2>
      <h3 style="text-align: center;">Payment Received! ✅</h3>
      <p>Dear ${name},</p>
      <p>Your payment has been successfully processed.</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p><strong>Order ID:</strong> #${orderId.slice(-8)}</p>
        <p><strong>Amount Paid:</strong> Rs. ${amount.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      </div>
      <p>Your order is now being processed.</p>
      <p>Thank you for shopping with us!</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZAHAF X <payments@zahafx.com>',
      to: [email],
      subject: `Payment Confirmation - Order #${orderId.slice(-8)}`,
      html: html,
    });

    if (error) throw error;
    console.log(`✅ Payment confirmation sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Payment confirmation error:', error.message);
    return false;
  }
};

// Alias for order confirmation (used by orderRoutes.js)
export const sendOrderConfirmationEmail = async (order) => {
  const customerEmail = order.email || order.user?.email;
  const customerName = order.user?.name || 'Customer';
  if (!customerEmail) return false;
  
  return sendOrderConfirmation(customerEmail, customerName, order._id, order.totalAmount);
};

// Alias for payment receipt (used by paymentRoutes.js)
export const sendPaymentReceiptEmail = async (order, paymentDetails) => {
  const customerEmail = order.email || order.user?.email;
  const customerName = order.user?.name || 'Customer';
  if (!customerEmail) return false;
  
  const paymentMethod = paymentDetails?.cardBrand || 'Credit/Debit Card';
  return sendPaymentConfirmation(customerEmail, customerName, order._id, order.totalAmount, paymentMethod);
};

// Alias for order status update (used by orderRoutes.js)
export const sendOrderStatusEmail = async (order, oldStatus, newStatus) => {
  const customerEmail = order.email || order.user?.email;
  const customerName = order.user?.name || 'Customer';
  if (!customerEmail) return false;

  const statusMessages = {
    processing: 'Your order is being processed.',
    shipped: 'Your order has been shipped! 🚚',
    delivered: 'Your order has been delivered. Enjoy your purchase! 🎉',
    cancelled: 'Your order has been cancelled.'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">ZAHAF X</h2>
      <h3 style="text-align: center;">Order Status Update</h3>
      <p>Dear ${customerName},</p>
      <p>Your order <strong>#${order._id.slice(-8)}</strong> status has been updated:</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 15px 0;">
        <span style="font-size: 14px;">Previous:</span>
        <span style="font-size: 18px; font-weight: bold;">${oldStatus?.toUpperCase()}</span>
        <span style="font-size: 20px; margin: 0 10px;">→</span>
        <span style="font-size: 18px; font-weight: bold; color: #2563eb;">${newStatus?.toUpperCase()}</span>
      </div>

      <p style="font-size: 16px;">${statusMessages[newStatus] || `Your order is now ${newStatus}.`}</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${config.frontendUrl}/orders/${order._id}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order Details</a>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'ZAHAF X <updates@zahafx.com>',
      to: [customerEmail],
      subject: `Order ${newStatus?.toUpperCase()} - #${order._id.slice(-8)}`,
      html: html,
    });

    if (error) throw error;
    console.log(`✅ Status update email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Status email error:', error.message);
    return false;
  }
};