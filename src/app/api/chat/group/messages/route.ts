// src/app/api/chat/group/messages/route.ts - GROUP CHAT API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Send message to group chat
export async function POST(request: Request) {
  try {
    console.log('💬 Sending message to group chat...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ 
        error: 'Message content is required' 
      }, { status: 400 })
    }

    console.log(`✅ Group message from ${session.user.email}: "${content.substring(0, 50)}..."`)

    try {
      // Try to find or create a general group room
      let groupRoom = await prisma.chatRoom.findFirst({
        where: {
          name: 'Group Discussion',
          type: 'GENERAL'
        }
      })

      if (!groupRoom) {
        // Create the group room if it doesn't exist
        groupRoom = await prisma.chatRoom.create({
          data: {
            name: 'Group Discussion',
            description: 'TaskFlow team chat',
            type: 'GENERAL',
            isPrivate: false,
            createdBy: session.user.id,
            memberCount: 0,
            messageCount: 0,
            isActive: true
          }
        })

        console.log(`✅ Created group room: ${groupRoom.id}`)
      }

      // Ensure user is a member of the group
      const membership = await prisma.chatRoomMember.findUnique({
        where: {
          roomId_userId: {
            roomId: groupRoom.id,
            userId: session.user.id
          }
        }
      })

      if (!membership) {
        // Add user to group room
        await prisma.chatRoomMember.create({
          data: {
            roomId: groupRoom.id,
            userId: session.user.id,
            role: 'MEMBER',
            isActive: true,
            unreadCount: 0
          }
        })

        console.log(`✅ Added user to group room`)
      }

      // Create the message
      const message = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          type: 'TEXT',
          roomId: groupRoom.id,
          senderId: session.user.id,
          isEdited: false,
          isDeleted: false
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // Update room stats
      await prisma.chatRoom.update({
        where: { id: groupRoom.id },
        data: {
          lastMessageAt: message.createdAt,
          messageCount: { increment: 1 }
        }
      })

      console.log(`✅ Group message sent successfully: ${message.id}`)

      const formattedMessage = {
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        createdAt: message.createdAt.toISOString(),
        isEdited: message.isEdited,
        sender: {
          id: message.sender.id,
          name: message.sender.name || 'Unknown User',
          email: message.sender.email,
          image: message.sender.image
        }
      }

      return NextResponse.json({ 
        message: formattedMessage,
        roomId: groupRoom.id,
        success: true
      }, { status: 201 })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        // Mock success response if tables don't exist
        const mockMessage = {
          id: `mock-${Date.now()}`,
          content: content.trim(),
          type: 'TEXT',
          senderId: session.user.id,
          createdAt: new Date().toISOString(),
          isEdited: false,
          sender: {
            id: session.user.id,
            name: session.user.name || 'You',
            email: session.user.email || '',
            image: session.user.image
          }
        }

        console.log('⚠️ Using mock response - chat tables not found')
        
        return NextResponse.json({
          message: mockMessage,
          isMockData: true,
          success: true,
          message: 'Chat system not initialized - using mock data'
        }, { status: 201 })
      }

      throw dbError
    }

  } catch (error) {
    console.error(`❌ Group message error:`, error)
    return NextResponse.json({ 
      error: 'Failed to send group message',
      details: error.message
    }, { status: 500 })
  }
}

// GET - Load group messages  
export async function GET() {
  try {
    console.log('🔍 Loading group messages...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        messages: [],
        error: 'Authentication required'
      }, { status: 401 })
    }

    try {
      // Find group room
      const groupRoom = await prisma.chatRoom.findFirst({
        where: {
          name: 'Group Discussion',
          type: 'GENERAL'
        }
      })

      if (!groupRoom) {
        return NextResponse.json({
          messages: [],
          total: 0,
          roomId: null,
          message: 'Group room not found'
        })
      }

      // Load messages
      const messages = await prisma.chatMessage.findMany({
        where: {
          roomId: groupRoom.id,
          isDeleted: false
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 50
      })

      const formattedMessages = messages.map(message => ({
        id: message.id,
        content: message.content,
        type: message.type,
        senderId: message.senderId,
        createdAt: message.createdAt.toISOString(),
        isEdited: message.isEdited,
        sender: {
          id: message.sender.id,
          name: message.sender.name || 'Unknown User',
          email: message.sender.email,
          image: message.sender.image
        }
      }))

      return NextResponse.json({
        messages: formattedMessages,
        total: formattedMessages.length,
        roomId: groupRoom.id,
        success: true
      })

    } catch (dbError) {
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        // Return mock group messages
        const mockMessages = [
          {
            id: 'mock-1',
            content: 'Welcome to TaskFlow group chat! 👋',
            type: 'TEXT',
            senderId: 'system',
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            isEdited: false,
            sender: {
              id: 'system',
              name: 'System',
              email: 'system@taskflow.com'
            }
          },
          {
            id: 'mock-2',
            content: 'Hello everyone! How is the project going?',
            type: 'TEXT',
            senderId: 'mock-user',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isEdited: false,
            sender: {
              id: 'mock-user',
              name: 'Team Member',
              email: 'team@taskflow.com'
            }
          }
        ]

        return NextResponse.json({
          messages: mockMessages,
          total: mockMessages.length,
          isMockData: true,
          message: 'Using mock group messages'
        })
      }

      throw dbError
    }

  } catch (error) {
    console.error('❌ Load group messages error:', error)
    return NextResponse.json({
      error: 'Failed to load group messages',
      details: error.message,
      messages: []
    }, { status: 500 })
  }
}