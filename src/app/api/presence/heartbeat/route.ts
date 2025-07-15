
// File 4: src/app/api/presence/heartbeat/route.ts
// Heartbeat endpoint to update user activity
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/presence/heartbeat - Update user's last activity
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPage, isActive } = body

    // Update user's last activity
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastActive: new Date(),
        // You could also store currentPage if you add it to schema
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Heartbeat error:', error)
    return NextResponse.json(
      { error: 'Failed to update heartbeat' },
      { status: 500 }
    )
  }
}