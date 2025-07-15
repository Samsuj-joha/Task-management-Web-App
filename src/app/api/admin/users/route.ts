// src/app/api/admin/users/route.ts - CREATE THIS FILE
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'
import { permissions } from '@/lib/permissions'

// GET /api/admin/users - Get all users (Admin only)
export async function GET() {
  return withAuth(async (user) => {
    try {
      console.log(`👥 Admin users request by: ${user.email} (${user.role})`)
      
      // Check if user is admin
      if (!permissions.canManageUsers(user)) {
        console.log(`❌ Access denied: ${user.email} is not admin`)
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }

      // Get all users with their stats
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          role: true,
          department: true,
          employeeId: true,
          isActive: true,
          status: true,
          joinedAt: true,
          lastActive: true,
          createdAt: true,
          // Include task statistics
          _count: {
            select: {
              tasks: true,          // Tasks created by user
              assignedTasks: true,  // Tasks assigned to user
              projects: true        // Projects owned by user
            }
          }
        },
        orderBy: [
          { role: 'desc' },    // Admins first
          { createdAt: 'desc' } // Then by newest
        ]
      })

      console.log(`✅ Found ${users.length} users for admin ${user.email}`)

      // Calculate some basic stats
      const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        users: users.filter(u => u.role === 'USER').length,
        active: users.filter(u => u.isActive).length,
        inactive: users.filter(u => !u.isActive).length
      }

      return NextResponse.json({
        users,
        stats,
        message: `Found ${users.length} users`
      })

    } catch (error) {
      console.error('❌ GET /api/admin/users error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  })
}