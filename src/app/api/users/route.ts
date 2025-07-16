// src/app/api/users/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all active users
    const users = await prisma.user.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      users,
      total: users.length
    })

  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}