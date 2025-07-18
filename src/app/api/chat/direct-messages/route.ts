// src/app/api/chat/direct-messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/chat/direct-messages - Get direct messages for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Mock data for now - replace with actual database query when you have chat tables
    const mockDirectMessages = [
      {
        id: 'dm1',
        senderId: 'user1',
        receiverId: session.user.id,
        content: 'Hey, can you review the latest task updates?',
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          name: 'John Doe',
          image: null,
          isOnline: true
        }
      },
      {
        id: 'dm2',
        senderId: 'user2', 
        receiverId: session.user.id,
        content: 'The project deadline has been moved to next week.',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        sender: {
          name: 'Jane Smith',
          image: null,
          isOnline: false
        }
      }
    ]

    // Filter unread messages for current user
    const unreadMessages = mockDirectMessages.filter(
      msg => !msg.isRead && msg.receiverId === session.user.id
    )

    return NextResponse.json({
      success: true,
      messages: unreadMessages,
      totalCount: mockDirectMessages.length
    })

  } catch (error) {
    console.error('Direct messages fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch direct messages' },
      { status: 500 }
    )
  }
}

// POST /api/chat/direct-messages - Send direct message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { receiverId, content, type = 'TEXT' } = await request.json()

    if (!receiverId || !content.trim()) {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      )
    }

    // Mock response - replace with actual database logic
    const message = {
      id: `dm-${Date.now()}`,
      content: content.trim(),
      type,
      senderId: session.user.id,
      receiverId,
      createdAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name || 'Unknown User',
        email: session.user.email || '',
        image: session.user.image
      }
    }

    // Trigger real-time event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('privateMessage', {
        detail: {
          type: 'private_message_sent',
          messageId: message.id,
          senderId: session.user.id,
          receiverId,
          content: message.content
        }
      }))
    }

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Send direct message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}