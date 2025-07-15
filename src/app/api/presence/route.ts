// File 3: src/app/api/presence/route.ts
// API endpoint for presence data
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/presence - Get all users' presence data
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/presence ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all users with their last activity
    const users = await prisma.user.findMany({
      where: {
        isActive: true // Only active users
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        department: true,
        lastActive: true,
        updatedAt: true,
        _count: {
          select: {
            assignedTasks: true,
            projects: true
          }
        }
      },
      orderBy: {
        lastActive: 'desc'
      }
    })

    console.log(`✅ Retrieved presence data for ${users.length} users`)

    return NextResponse.json({
      users,
      total: users.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ GET /api/presence error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch presence data' },
      { status: 500 }
    )
  }
}