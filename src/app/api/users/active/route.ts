// app/api/users/active/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get users who have been active in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        lastActive: {
          gte: twentyFourHoursAgo
        }
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        lastActive: true,
        isOnline: true,
        createdAt: true
      },
      orderBy: {
        lastActive: 'desc'
      },
      take: 20 // Limit to 20 most recent active users
    })

    console.log(`📊 Found ${activeUsers.length} active users in last 24 hours`)

    return NextResponse.json({
      users: activeUsers,
      count: activeUsers.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Get active users error:', error)
    return NextResponse.json(
      { error: 'Failed to load active users' },
      { status: 500 }
    )
  }
}

// PUT endpoint to update user's last active time
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update current user's last active time
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastActive: new Date(),
        isOnline: true
      }
    })

    console.log(`✅ Updated last active time for user: ${session.user.id}`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Update active status error:', error)
    return NextResponse.json(
      { error: 'Failed to update active status' },
      { status: 500 }
    )
  }
}