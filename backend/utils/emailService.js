import nodemailer from 'nodemailer';
import config from '../config/index.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationOTP = async (email, name, otp) => {
  const verificationUrl = `${config.frontendUrl}/verify-otp?email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - ZAHAF-X',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to ZAHAF-X, ${name}!</h2>
        <p>Your verification OTP is: <strong>${otp}</strong></p>
        <p>Or click: <a href="${verificationUrl}">Verify Email</a></p>
        <p>This OTP expires in 10 minutes.</p>
      </div>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ OTP error:', error.message);
    return false;
  }
};

// ✅ ADD THIS MISSING FUNCTION
export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to ZAHAF-X - Email Verified! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome to ZAHAF-X, ${name}! 🎉</h2>
        <p>Your email has been successfully verified. You can now:</p>
        <ul>
          <li>Login to your account</li>
          <li>Browse our amazing electronics</li>
          <li>Add items to cart and wishlist</li>
          <li>Place orders</li>
        </ul>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${config.frontendUrl}/login" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Login Now
          </a>
        </div>
        <p>Happy Shopping! 🛍️</p>
        <p>- Team ZAHAF-X</p>
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

export const sendPasswordResetOTP = async (email, name, otp) => {
  const resetUrl = `${config.frontendUrl}/reset-password?email=${encodeURIComponent(email)}`;
  
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP - ZAHAF-X',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Dear ${name},</p>
        <p>Your password reset OTP is: <strong>${otp}</strong></p>
        <p>Or click: <a href="${resetUrl}">Reset Password</a></p>
        <p>This OTP expires in 10 minutes.</p>
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

// Optional: Add other email functions as needed
export const sendOrderConfirmation = async (email, name, orderId, totalAmount) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Thank you for your order, ${name}!</h2>
        <p>Your order #${orderId} has been placed successfully.</p>
        <p>Total Amount: ₹${totalAmount}</p>
        <p>We'll notify you once your order is shipped.</p>
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

export const sendPaymentConfirmation = async (email, name, orderId, amount, paymentMethod) => {
  const mailOptions = {
    from: `"ZAHAF-X" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payment Confirmation - Order #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Payment Received! ✅</h2>
        <p>Dear ${name},</p>
        <p>Your payment of ₹${amount} via ${paymentMethod} has been received.</p>
        <p>Your order #${orderId} is now being processed.</p>
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