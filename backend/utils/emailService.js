import nodemailer from 'nodemailer'

// Create transporter (using Ethereal for testing - free, no SMTP needed)
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })
}

let transporter = null

export const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTestAccount()
    console.log('📧 Email service ready (Ethereal - testing mode)')
    console.log(`📧 Preview emails at: https://ethereal.email/login`)
  }
  return transporter
}

export const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = await getTransporter()
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`
  
  const info = await transporter.sendMail({
    from: '"ZAHAF-X" <noreply@zahafx.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  })
  
  console.log('Reset email sent:', nodemailer.getTestMessageUrl(info))
  return nodemailer.getTestMessageUrl(info)
}

export const sendVerificationEmail = async (email, name, token) => {
  const transporter = await getTransporter()
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`
  
  const info = await transporter.sendMail({
    from: '"ZAHAF-X" <noreply@zahafx.com>',
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Welcome to ZAHAF-X, ${name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
      </div>
    `
  })
  
  console.log('Verification email sent:', nodemailer.getTestMessageUrl(info))
  return nodemailer.getTestMessageUrl(info)
}