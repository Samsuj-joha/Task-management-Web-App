// src/app/api/users/route.ts - NEW FILE
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'

// GET /api/users - Get all active users for assignment
export async function GET(request: Request) {
  return withAuth(async (user) => {
    try {
      console.log(`🔍 Fetching users for assignment by ${user.email} (${user.role})`)
      
      // Get all active users
      const users = await prisma.user.findMany({
        where: {
          isActive: true // Only active users
        },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          role: true,
          department: true,
          status: true
        },
        orderBy: [
          { name: 'asc' },
          { email: 'asc' }
        ]
      })

      console.log(`✅ Found ${users.length} active users`)

      // Format users for dropdown
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name || `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email,
        image: user.image,
        role: user.role,
        department: user.department,
        status: user.status,
        initials: getInitials(user.name || user.firstName || user.email)
      }))

      return NextResponse.json({
        users: formattedUsers,
        total: formattedUsers.length
      })

    } catch (error) {
      console.error('❌ GET /api/users error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })
}

// Helper function to generate initials
function getInitials(name: string): string {
  if (!name) return 'U'
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}