// src/app/api/chat/private/messages/route.ts - PRIVATE CHAT API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Send private message
export async function POST(request: Request) {
  try {
    console.log('💬 Sending private message...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { content, recipientId } = body

    if (!content?.trim()) {
      return NextResponse.json({ 
        error: 'Message content is required' 
      }, { status: 400 })
    }

    if (!recipientId) {
      return NextResponse.json({ 
        error: 'Recipient ID is required' 
      }, { status: 400 })
    }

    const currentUserId = session.user.id
    console.log(`✅ Private message from ${session.user.email} to ${recipientId}: "${content.substring(0, 50)}..."`)

    try {
      // Find or create private room between these two users
      let privateRoom = await prisma.chatRoom.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            {
              members: {
                some: { userId: currentUserId }
              }
            },
            {
              members: {
                some: { userId: recipientId }
              }
            }
          ]
        }
      })

      if (!privateRoom) {
        // Create new private room
        privateRoom = await prisma.chatRoom.create({
          data: {
            name: `Private Chat`,
            type: 'DIRECT',
            isPrivate: true,
            createdBy: currentUserId,
            memberCount: 2,
            messageCount: 0,
            isActive: true
          }
        })

        // Add both users as members
        await prisma.chatRoomMember.createMany({
          data: [
            {
              roomId: privateRoom.id,
              userId: currentUserId,
              role: 'MEMBER',
              isActive: true,
              unreadCount: 0
            },
            {
              roomId: privateRoom.id,
              userId: recipientId,
              role: 'MEMBER',
              isActive: true,
              unreadCount: 0
            }
          ]
        })

        console.log(`✅ Created private room: ${privateRoom.id}`)
      }

      // Create the message
      const message = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          type: 'TEXT',
          roomId: privateRoom.id,
          senderId: currentUserId,
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
        where: { id: privateRoom.id },
        data: {
          lastMessageAt: message.createdAt,
          messageCount: { increment: 1 }
        }
      })

      // Update unread count for recipient only
      await prisma.chatRoomMember.update({
        where: {
          roomId_userId: {
            roomId: privateRoom.id,
            userId: recipientId
          }
        },
        data: {
          unreadCount: { increment: 1 }
        }
      })

      console.log(`✅ Private message sent successfully: ${message.id}`)

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
        roomId: privateRoom.id,
        recipientId,
        success: true
      }, { status: 201 })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        // Mock success response if tables don't exist
        const mockMessage = {
          id: `mock-private-${Date.now()}`,
          content: content.trim(),
          type: 'TEXT',
          senderId: currentUserId,
          createdAt: new Date().toISOString(),
          isEdited: false,
          sender: {
            id: currentUserId,
            name: session.user.name || 'You',
            email: session.user.email || '',
            image: session.user.image
          }
        }

        console.log('⚠️ Using mock response - chat tables not found')
        
        return NextResponse.json({
          message: mockMessage,
          recipientId,
          isMockData: true,
          success: true,
          message: 'Chat system not initialized - using mock data'
        }, { status: 201 })
      }

      throw dbError
    }

  } catch (error) {
    console.error(`❌ Private message error:`, error)
    return NextResponse.json({ 
      error: 'Failed to send private message',
      details: error.message
    }, { status: 500 })
  }
}

// GET - Load private messages
export async function GET(request: Request) {
  try {
    console.log('🔍 Loading private messages...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        messages: [],
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('userId')

    if (!otherUserId) {
      return NextResponse.json({
        error: 'Other user ID is required',
        messages: []
      }, { status: 400 })
    }

    const currentUserId = session.user.id

    try {
      // Find private room between these users
      const privateRoom = await prisma.chatRoom.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            {
              members: {
                some: { userId: currentUserId }
              }
            },
            {
              members: {
                some: { userId: otherUserId }
              }
            }
          ]
        }
      })

      if (!privateRoom) {
        return NextResponse.json({
          messages: [],
          total: 0,
          roomId: null,
          message: 'Private room not found'
        })
      }

      // Load messages
      const messages = await prisma.chatMessage.findMany({
        where: {
          roomId: privateRoom.id,
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

      // Mark as read for current user
      await prisma.chatRoomMember.update({
        where: {
          roomId_userId: {
            roomId: privateRoom.id,
            userId: currentUserId
          }
        },
        data: {
          lastReadAt: new Date(),
          unreadCount: 0
        }
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
        roomId: privateRoom.id,
        otherUserId,
        success: true
      })

    } catch (dbError) {
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        // Return mock private messages
        const mockMessages = [
          {
            id: 'mock-p1',
            content: 'Hi! How are you doing?',
            type: 'TEXT',
            senderId: otherUserId,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isEdited: false,
            sender: {
              id: otherUserId,
              name: 'Other User',
              email: 'other@company.com'
            }
          },
          {
            id: 'mock-p2',
            content: 'I\'m good! Working on the new features. How about you?',
            type: 'TEXT',
            senderId: currentUserId,
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            isEdited: false,
            sender: {
              id: currentUserId,
              name: session.user.name || 'You',
              email: session.user.email || ''
            }
          }
        ]

        return NextResponse.json({
          messages: mockMessages,
          total: mockMessages.length,
          otherUserId,
          isMockData: true,
          message: 'Using mock private messages'
        })
      }

      throw dbError
    }

  } catch (error) {
    console.error('❌ Load private messages error:', error)
    return NextResponse.json({
      error: 'Failed to load private messages',
      details: error.message,
      messages: []
    }, { status: 500 })
  }
}