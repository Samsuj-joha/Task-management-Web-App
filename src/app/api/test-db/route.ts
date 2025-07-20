// app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log('🔍 Testing database connection...')
  
  try {
    // Test basic database connection
    const userCount = await prisma.user.count()
    console.log('👥 Total users in database:', userCount)
    
    // Test if reset fields exist by trying to find a user
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        resetToken: true,
        resetTokenExpiry: true
      }
    })
    
    console.log('🔧 Sample user data:', sampleUser)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      resetFieldsAvailable: true,
      sampleUserFound: !!sampleUser,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('❌ Database connection error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}