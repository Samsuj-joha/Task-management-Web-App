// app/api/auth/forgot-password/route.ts - DEBUG VERSION
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Simple logging function for development
function logPasswordResetEmail(email: string, resetToken: string) {
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

export async function POST(request: Request) {
  console.log('🚀 Forgot password API called')
  
  try {
    // Parse request body
    console.log('📥 Parsing request body...')
    const body = await request.json()
    const { email } = body

    console.log('📧 Email received:', email)

    // Validate email
    if (!email || typeof email !== 'string') {
      console.log('❌ Invalid email provided')
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    console.log('🔍 Looking for user:', normalizedEmail)

    // Test database connection first
    console.log('🔗 Testing database connection...')
    try {
      const userCount = await prisma.user.count()
      console.log('✅ Database connected. Total users:', userCount)
    } catch (dbTestError) {
      console.error('❌ Database connection failed:', dbTestError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Check if user exists
    console.log('👤 Finding user in database...')
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true }
      })
      console.log('👤 User found:', user ? 'Yes' : 'No')
    } catch (userFindError) {
      console.error('❌ Error finding user:', userFindError)
      return NextResponse.json(
        { error: 'Error searching for user' },
        { status: 500 }
      )
    }

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      console.log(`⚠️ Password reset requested for non-existent email: ${normalizedEmail}`)
      
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json({
        message: 'If this email exists in our system, you will receive reset instructions.',
        success: true
      })
    }

    // Generate secure reset token
    console.log('🎲 Generating reset token...')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    console.log('🎲 Generated reset token for user:', user.id)

    // Save reset token to database
    console.log('💾 Saving reset token to database...')
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      })
      console.log('✅ Reset token saved to database')
    } catch (updateError) {
      console.error('❌ Failed to save reset token:', updateError)
      return NextResponse.json(
        { error: 'Failed to process password reset request' },
        { status: 500 }
      )
    }

    // Send reset email (using simple logging for now)
    console.log('📧 Sending reset email...')
    try {
      logPasswordResetEmail(normalizedEmail, resetToken)
      console.log('📝 Reset email logged (development mode)')
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError)
      
      // Clean up the token if email fails
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: null,
            resetTokenExpiry: null,
          }
        })
        console.log('🧹 Cleaned up reset token after email failure')
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup reset token:', cleanupError)
      }

      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again or contact IT support.' },
        { status: 500 }
      )
    }

    console.log('✅ Password reset process completed successfully')
    return NextResponse.json({
      message: 'If this email exists in our system, you will receive reset instructions.',
      success: true
    })

  } catch (error) {
    console.error('❌ Forgot password error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}