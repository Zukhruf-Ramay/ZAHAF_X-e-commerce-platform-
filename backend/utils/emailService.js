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