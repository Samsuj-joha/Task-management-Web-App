// src/app/api/notifications/route.ts - DYNAMIC NOTIFICATIONS
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET real-time notification counts
export async function GET() {
  try {
    console.log('🔔 Loading dynamic notifications...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        notifications: [],
        counts: { total: 0, chat: 0, tasks: 0, urgent: 0 },
        authenticated: false
      }, { status: 401 })
    }

    const currentUserId = session.user.id
    console.log(`✅ Loading notifications for ${session.user.email}`)

    try {
      // 🔔 DYNAMIC CHAT NOTIFICATIONS - Real unread message counts
      const chatNotifications = await prisma.chatRoomMember.findMany({
        where: {
          userId: currentUserId,
          isActive: true,
          unreadCount: { gt: 0 } // Only rooms with unread messages
        },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              type: true,
              lastMessageAt: true
            }
          }
        },
        orderBy: {
          room: {
            lastMessageAt: 'desc'
          }
        }
      })

      // 🔔 DYNAMIC TASK NOTIFICATIONS - Real overdue/urgent tasks
      const now = new Date()
      const urgentTasks = await prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: currentUserId },
            { creatorId: currentUserId }
          ],
          status: { not: 'COMPLETED' },
          OR: [
            // Overdue tasks
            {
              dueDate: { lt: now },
              status: { not: 'COMPLETED' }
            },
            // Urgent priority tasks
            {
              priority: 'URGENT',
              status: { not: 'COMPLETED' }
            },
            // Tasks due in next 24 hours
            {
              dueDate: {
                gte: now,
                lte: new Date(now.getTime() + 24 * 60 * 60 * 1000)
              },
              status: { not: 'COMPLETED' }
            }
          ]
        },
        select: {
          id: true,
          title: true,
          name: true,
          priority: true,
          dueDate: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          dueDate: 'asc'
        }
      })

      // Format chat notifications
      const chatNotifs = chatNotifications.map(membership => ({
        id: `chat-${membership.room.id}`,
        type: 'chat_unread',
        title: 'New Messages',
        message: `${membership.unreadCount} new message${membership.unreadCount > 1 ? 's' : ''} in ${membership.room.name}`,
        timestamp: membership.room.lastMessageAt || new Date(),
        isRead: false,
        priority: membership.unreadCount > 5 ? 'high' : 'medium',
        actionUrl: `/dashboard/chat?room=${membership.room.id}`,
        chatRoomId: membership.room.id,
        unreadCount: membership.unreadCount
      }))

      // Format task notifications
      const taskNotifs = urgentTasks.map(task => {
        const isOverdue = task.dueDate && new Date(task.dueDate) < now
        const isUrgent = task.priority === 'URGENT'
        
        let title = 'Task Reminder'
        let message = `"${task.title || task.name}" needs attention`
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'

        if (isOverdue) {
          title = 'Overdue Task'
          const daysOverdue = Math.floor((now.getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24))
          message = `"${task.title || task.name}" is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`
          priority = 'urgent'
        } else if (isUrgent) {
          title = 'Urgent Task'
          message = `"${task.title || task.name}" is marked as urgent`
          priority = 'high'
        } else if (task.dueDate) {
          const hoursUntilDue = Math.floor((new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60))
          title = 'Task Due Soon'
          message = `"${task.title || task.name}" is due in ${hoursUntilDue} hour${hoursUntilDue !== 1 ? 's' : ''}`
          priority = 'high'
        }

        return {
          id: `task-${task.id}`,
          type: isOverdue ? 'task_overdue' : isUrgent ? 'task_urgent' : 'task_due_soon',
          title,
          message,
          timestamp: task.dueDate || task.createdAt,
          isRead: false,
          priority,
          actionUrl: '/dashboard/tasks',
          taskId: task.id
        }
      })

      // Combine all notifications
      const allNotifications = [...chatNotifs, ...taskNotifs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20) // Limit to 20 most recent

      // Calculate dynamic counts
      const counts = {
        total: allNotifications.length,
        chat: chatNotifs.reduce((total, notif) => total + (notif.unreadCount || 1), 0),
        tasks: taskNotifs.length,
        urgent: allNotifications.filter(n => n.priority === 'urgent').length,
        overdue: taskNotifs.filter(n => n.type === 'task_overdue').length,
        unreadMessages: chatNotifs.reduce((total, notif) => total + (notif.unreadCount || 0), 0)
      }

      console.log(`✅ Dynamic notifications loaded:`, counts)

      return NextResponse.json({
        notifications: allNotifications,
        counts,
        authenticated: true,
        lastUpdated: new Date().toISOString(),
        success: true
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        // Return mock dynamic notifications
        const mockNotifications = [
          {
            id: 'mock-chat-1',
            type: 'chat_unread',
            title: 'New Messages',
            message: '2 new messages in General Discussion',
            timestamp: new Date(),
            isRead: false,
            priority: 'medium',
            actionUrl: '/dashboard/chat?room=1',
            unreadCount: 2
          },
          {
            id: 'mock-task-1',
            type: 'task_due_soon',
            title: 'Task Due Soon',
            message: '"Complete user testing" is due in 4 hours',
            timestamp: new Date(),
            isRead: false,
            priority: 'high',
            actionUrl: '/dashboard/tasks'
          }
        ]

        const mockCounts = {
          total: mockNotifications.length,
          chat: 2,
          tasks: 1,
          urgent: 0,
          overdue: 0,
          unreadMessages: 2
        }

        return NextResponse.json({
          notifications: mockNotifications,
          counts: mockCounts,
          authenticated: true,
          isMockData: true,
          message: 'Using mock dynamic notifications'
        })
      }

      throw dbError
    }

  } catch (error) {
    console.error('❌ Dynamic notifications error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load notifications',
        details: error.message,
        notifications: [],
        counts: { total: 0, chat: 0, tasks: 0, urgent: 0 }
      },
      { status: 500 }
    )
  }
}

// POST - Mark notifications as read
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAllRead = false } = body

    if (markAllRead) {
      // Mark all chat messages as read
      await prisma.chatRoomMember.updateMany({
        where: {
          userId: session.user.id,
          isActive: true
        },
        data: {
          unreadCount: 0,
          lastReadAt: new Date()
        }
      })

      console.log(`✅ Marked all notifications as read for ${session.user.email}`)
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific chat rooms as read
      const chatRoomIds = notificationIds
        .filter(id => id.startsWith('chat-'))
        .map(id => id.replace('chat-', ''))

      if (chatRoomIds.length > 0) {
        await prisma.chatRoomMember.updateMany({
          where: {
            userId: session.user.id,
            roomId: { in: chatRoomIds },
            isActive: true
          },
          data: {
            unreadCount: 0,
            lastReadAt: new Date()
          }
        })
      }

      console.log(`✅ Marked ${notificationIds.length} notifications as read`)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Notifications marked as read'
    })

  } catch (error) {
    console.error('❌ Mark notifications read error:', error)
    return NextResponse.json({ 
      error: 'Failed to mark notifications as read',
      details: error.message
    }, { status: 500 })
  }
}