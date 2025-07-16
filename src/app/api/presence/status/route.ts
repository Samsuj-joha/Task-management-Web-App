// // File 5: src/app/api/presence/status/route.ts
// // Update user presence status
// import { NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'

// // POST /api/presence/status - Update user's presence status
// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions)
    
//     if (!session?.user?.id) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       )
//     }

//     const body = await request.json()
//     const { status } = body

//     // Validate status
//     if (!['ONLINE', 'AWAY', 'OFFLINE'].includes(status)) {
//       return NextResponse.json(
//         { error: 'Invalid status' },
//         { status: 400 }
//       )
//     }

//     // Update user's presence status
//     await prisma.user.update({
//       where: { id: session.user.id },
//       data: {
//         status: status,
//         lastActive: status === 'OFFLINE' ? null : new Date(),
//         updatedAt: new Date()
//       }
//     })

//     console.log(`🔄 User ${session.user.email} status updated to ${status}`)

//     return NextResponse.json({
//       success: true,
//       status,
//       timestamp: new Date().toISOString()
//     })

//   } catch (error) {
//     console.error('❌ Status update error:', error)
//     return NextResponse.json(
//       { error: 'Failed to update status' },
//       { status: 500 }
//     )
//   }
// }



// src/app/api/presence/status/route.ts
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

    // For now, return simple presence data
    // You can enhance this later with real-time WebSocket presence
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        lastActive: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Active in last 5 minutes
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        lastActive: true
      },
      take: 10
    })

    return NextResponse.json({
      activeUsers,
      total: activeUsers.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('GET /api/presence/status error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch presence status',
        activeUsers: [],
        total: 0,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// POST - Update user's last active timestamp
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update user's last active timestamp
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastActive: new Date() }
    })

    return NextResponse.json({ 
      success: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('POST /api/presence/status error:', error)
    return NextResponse.json(
      { error: 'Failed to update presence' },
      { status: 500 }
    )
  }
}