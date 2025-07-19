// src/app/api/users/online-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isOnline, lastSeen, socketId } = await request.json()

    // Update user's online status
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        isOnline: Boolean(isOnline),
        lastSeen: lastSeen ? new Date(lastSeen) : new Date(),
        socketId: socketId || null,
        lastActive: new Date()
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        isOnline: true,
        lastSeen: true
      }
    })

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating online status:', error)
    return NextResponse.json(
      { error: 'Failed to update online status' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all online users
    const onlineUsers = await prisma.user.findMany({
      where: {
        isOnline: true,
        isActive: true,
        id: {
          not: session.user.id // Exclude current user
        }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        isOnline: true,
        lastSeen: true,
        role: true,
        department: true
      },
      orderBy: {
        lastSeen: 'desc'
      }
    })

    // Transform data for frontend
    const transformedUsers = onlineUsers.map(user => ({
      userId: user.id,
      userName: `${user.firstName || user.name} ${user.lastName || ''}`.trim(),
      userEmail: user.email,
      userImage: user.image,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      role: user.role,
      department: user.department
    }))

    return NextResponse.json({ 
      success: true,
      users: transformedUsers,
      count: transformedUsers.length
    })
  } catch (error) {
    console.error('Error fetching online users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch online users' },
      { status: 500 }
    )
  }
}