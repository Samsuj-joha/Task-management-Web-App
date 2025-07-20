// lib/email.ts - FIXED VERSION
import nodemailer from 'nodemailer'

// Create transporter (FIXED: removed the 'r' from createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: `"TaskFlow - Paragon Group" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your TaskFlow Password - TaskFlow',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🔄 TaskFlow</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Paragon Group</p>
            </div>
            
            <h2 style="color: #333;">Reset Your Password</h2>
            
            <p style="color: #555;">
              Hello! We received a request to reset your TaskFlow password. 
              Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy this link: <br>
              <code style="background-color: #f8f9fa; padding: 5px;">${resetUrl}</code>
            </p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0;">🔒 Security Notice</h3>
              <ul style="color: #856404; margin: 0;">
                <li>This link expires in 1 hour</li>
                <li>Only use if you requested this reset</li>
                <li>Ignore this email if you didn't request it</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 Paragon Group. Internal Use Only.
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw error
  }
}

// For development - log email instead of sending
export async function logPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  console.log(`
========================================
📧 PASSWORD RESET EMAIL (DEV MODE)
========================================
To: ${email}
Subject: Reset Your TaskFlow Password

Reset Link: ${resetUrl}

This link expires in 1 hour.
========================================
  `)
  
  return { success: true, messageId: 'dev-mode-log' }
}

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify()
    console.log('✅ Email connection verified')
    return true
  } catch (error) {
    console.error('❌ Email connection failed:', error)
    return false
  }
}