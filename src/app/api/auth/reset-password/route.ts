// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  console.log('🚀 Reset password API called')
  
  try {
    // Parse request body
    const body = await request.json()
    const { token, password } = body

    console.log('🔑 Token received:', token ? 'Yes' : 'No')
    console.log('🔒 Password received:', password ? 'Yes' : 'No')

    // Validate input
    if (!token || !password) {
      console.log('❌ Missing token or password')
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('❌ Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    console.log('🔍 Looking for user with reset token')

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      console.log('❌ Invalid or expired reset token')
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    console.log('👤 User found for password reset:', user.email)

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('🔐 Password hashed successfully')

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })

    console.log(`✅ Password reset successful for user: ${user.email}`)

    return NextResponse.json({
      message: 'Password reset successful. You can now log in with your new password.',
      success: true
    })

  } catch (error) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}