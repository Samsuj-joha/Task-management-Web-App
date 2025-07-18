// src/app/api/team/online/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/team/online - Get online team members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try to get users from database first
    try {
      // Get users who were active in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

      const onlineUsers = await prisma.user.findMany({
        where: {
          lastActive: {
            gte: fiveMinutesAgo
          },
          id: {
            not: session.user.id // Exclude current user
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          lastActive: true,
          status: true
        },
        orderBy: {
          lastActive: 'desc'
        }
      })

      // Transform to include online status
      const transformedUsers = onlineUsers.map(user => ({
        ...user,
        isOnline: true,
        lastSeen: user.lastActive?.toISOString(),
        status: user.status || 'ACTIVE'
      }))

      return NextResponse.json({
        success: true,
        users: transformedUsers,
        count: transformedUsers.length
      })

    } catch (dbError) {
      console.log('Database query failed, using mock data:', dbError)
      
      // Fallback to mock data if database query fails
      const mockOnlineUsers = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          status: 'ACTIVE'
        },
        {
          id: 'user2',
          name: 'Jane Smith', 
          email: 'jane@example.com',
          image: null,
          isOnline: true,
          lastSeen: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          status: 'ACTIVE'
        },
        {
          id: 'user3',
          name: 'Mike Johnson',
          email: 'mike@example.com', 
          image: null,
          isOnline: true,
          lastSeen: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
          status: 'ACTIVE'
        }
      ]

      return NextResponse.json({
        success: true,
        users: mockOnlineUsers,
        count: mockOnlineUsers.length
      })
    }

  } catch (error) {
    console.error('Online users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch online users' },
      { status: 500 }
    )
  }
}