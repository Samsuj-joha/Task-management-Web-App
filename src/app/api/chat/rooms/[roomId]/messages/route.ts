// src/app/api/chat/rooms/[roomId]/messages/route.ts - PRIVATE CHAT VERSION
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET messages - ONLY participants can see their private chat
export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    console.log(`🔍 Loading PRIVATE messages for room: ${params.roomId}`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Authentication required',
        messages: []
      }, { status: 401 })
    }

    const currentUserId = session.user.id
    console.log(`✅ User ${session.user.email} requesting messages`)

    try {
      // 🔒 PRIVACY CHECK: Verify user is a participant in this room
      const roomMembership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId: params.roomId,
          userId: currentUserId,
          isActive: true
        },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              type: true,
              isPrivate: true
            }
          }
        }
      })

      if (!roomMembership) {
        console.log(`❌ PRIVACY VIOLATION: User ${session.user.email} is NOT a member of room ${params.roomId}`)
        return NextResponse.json({ 
          error: 'Access denied - You are not a participant in this conversation',
          messages: [],
          isPrivacyViolation: true
        }, { status: 403 })
      }

      console.log(`✅ PRIVACY OK: User is authorized to see this conversation`)

      // Load messages ONLY for authorized participants
      const messages = await prisma.chatMessage.findMany({
        where: {
          roomId: params.roomId,
          isDeleted: false
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isOnline: true
            }
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 50
      })

      // Update user's read status and reset unread count
      await prisma.chatRoomMember.update({
        where: {
          roomId_userId: {
            roomId: params.roomId,
            userId: currentUserId
          }
        },
        data: {
          lastReadAt: new Date(),
          unreadCount: 0
        }
      })

      console.log(`✅ Loaded ${messages.length} PRIVATE messages for authorized user`)

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
          image: message.sender.image,
          isOnline: message.sender.isOnline || false
        },
        replyTo: message.replyTo ? {
          id: message.replyTo.id,
          content: message.replyTo.content,
          sender: {
            name: message.replyTo.sender.name || 'Unknown User'
          }
        } : undefined
      }))

      return NextResponse.json({
        messages: formattedMessages,
        total: formattedMessages.length,
        roomId: params.roomId,
        roomName: roomMembership.room.name,
        roomType: roomMembership.room.type,
        isPrivate: roomMembership.room.isPrivate,
        authenticated: true,
        isParticipant: true
      })

    } catch (dbError) {
      console.error('Database error:', dbError)
      
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        // Return mock private messages for testing
        console.log('⚠️ Using mock private data for testing')
        
        const mockMessages = [
          {
            id: '1',
            content: 'Hey! How are you doing?',
            type: 'TEXT',
            senderId: currentUserId === 'user-1' ? 'user-2' : 'user-1',
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            isEdited: false,
            sender: {
              id: currentUserId === 'user-1' ? 'user-2' : 'user-1',
              name: 'Other Person',
              email: 'other@company.com',
              isOnline: true
            }
          },
          {
            id: '2',
            content: 'I\'m good! Working on the new features. How about you?',
            type: 'TEXT',
            senderId: currentUserId,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isEdited: false,
            sender: {
              id: currentUserId,
              name: session.user.name || 'You',
              email: session.user.email || '',
              isOnline: true
            }
          }
        ]

        return NextResponse.json({
          messages: mockMessages,
          total: mockMessages.length,
          roomId: params.roomId,
          isMockData: true,
          isPrivate: true,
          message: 'Private conversation - only participants can see this'
        })
      }

      throw dbError
    }

  } catch (error) {
    console.error(`❌ Error loading private messages:`, error)
    return NextResponse.json(
      { 
        error: 'Failed to load messages',
        details: error.message,
        messages: []
      },
      { status: 500 }
    )
  }
}

// POST - Send message to PRIVATE conversation
export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const body = await request.json()
    const { content, type = 'TEXT' } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    try {
      // 🔒 PRIVACY CHECK: Verify user can send to this room
      const roomMembership = await prisma.chatRoomMember.findFirst({
        where: {
          roomId: params.roomId,
          userId: currentUserId,
          isActive: true
        }
      })

      if (!roomMembership) {
        console.log(`❌ PRIVACY VIOLATION: User ${session.user.email} cannot send to room ${params.roomId}`)
        return NextResponse.json({ 
          error: 'Access denied - You cannot send messages to this conversation'
        }, { status: 403 })
      }

      // Create message in PRIVATE conversation
      const message = await prisma.chatMessage.create({
        data: {
          content: content.trim(),
          type,
          roomId: params.roomId,
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
              image: true,
              isOnline: true
            }
          }
        }
      })

      // 🔔 DYNAMIC NOTIFICATIONS: Update unread counts for OTHER participants only
      await prisma.chatRoomMember.updateMany({
        where: {
          roomId: params.roomId,
          userId: { not: currentUserId }, // Only other participants
          isActive: true
        },
        data: {
          unreadCount: { increment: 1 }
        }
      })

      // Update room's last message timestamp
      await prisma.chatRoom.update({
        where: { id: params.roomId },
        data: {
          lastMessageAt: message.createdAt,
          messageCount: { increment: 1 }
        }
      })

      console.log(`✅ PRIVATE message sent successfully to room ${params.roomId}`)

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
          image: message.sender.image,
          isOnline: message.sender.isOnline || false
        }
      }

      return NextResponse.json({ 
        message: formattedMessage,
        success: true,
        isPrivate: true
      }, { status: 201 })

    } catch (dbError) {
      if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
        return NextResponse.json({
          error: 'Chat system not initialized',
          needsMigration: true
        }, { status: 503 })
      }
      throw dbError
    }

  } catch (error) {
    console.error(`❌ Send private message error:`, error)
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error.message
    }, { status: 500 })
  }
}