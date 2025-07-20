// app/api/socket-test/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'Socket.IO test endpoint',
    timestamp: new Date().toISOString(),
    server: 'Next.js API Route',
    socketSupport: 'Available'
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'OK',
    message: 'Socket.IO POST test successful',
    timestamp: new Date().toISOString()
  })
}
