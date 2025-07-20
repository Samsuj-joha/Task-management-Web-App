// app/api/test-simple/route.ts - Simple Test API
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Simple test API called')
  
  return NextResponse.json({
    success: true,
    message: 'Simple API test successful',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}

export async function POST(request: Request) {
  console.log('🧪 Simple POST test API called')
  
  try {
    const body = await request.json()
    console.log('📥 Received body:', body)
    
    return NextResponse.json({
      success: true,
      message: 'POST test successful',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Simple test error:', error)
    return NextResponse.json(
      { error: 'Failed to parse request' },
      { status: 400 }
    )
  }
}