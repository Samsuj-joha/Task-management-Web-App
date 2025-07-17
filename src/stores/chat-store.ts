// src/stores/chat-store.ts - DYNAMIC DATABASE VERSION
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'

// Types (matching your Prisma schema)
interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'GENERAL' | 'PROJECT' | 'DIRECT' | 'ANNOUNCEMENT'
  isPrivate: boolean
  memberCount: number
  messageCount: number
  lastMessageAt?: Date
  unreadCount: number
  userRole: 'ADMIN' | 'MODERATOR' | 'MEMBER'
  project?: {
    id: string
    name: string
    color?: string
  }
}

interface ChatMessage {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'TASK_UPDATE'
  senderId: string
  roomId: string
  replyToId?: string
  isEdited: boolean
  createdAt: Date
  sender: {
    id: string
    name: string
    email: string
    image?: string
    isOnline: boolean
  }
  replyTo?: {
    id: string
    content: string
    sender: { name: string }
  }
  reactions?: MessageReaction[]
  attachments?: MessageAttachment[]
}

interface MessageReaction {
  id: string
  emoji: string
  userId: string
  user: { name: string }
}

interface MessageAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

interface OnlineUser {
  id: string
  name: string
  email: string
  image?: string
  isOnline: boolean
  lastSeen?: Date
  status: 'ACTIVE' | 'AWAY' | 'INACTIVE'
}

interface TypingStatus {
  roomId: string
  userId: string
  userName: string
}

interface ChatStore {
  // Connection state
  socket: Socket | null
  isConnected: boolean
  
  // Data state
  rooms: ChatRoom[]
  messages: Record<string, ChatMessage[]>
  onlineUsers: OnlineUser[]
  currentRoomId: string | null
  typingUsers: TypingStatus[]
  
  // UI state
  isLoadingRooms: boolean
  isLoadingMessages: boolean
  isSidebarOpen: boolean
  
  // Real-time status
  lastUpdate: Date
  connectionAttempts: number
  
  // Actions
  initializeSocket: () => void
  disconnectSocket: () => void
  loadRooms: () => Promise<void>
  loadMessages: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, content: string, replyToId?: string) => Promise<void>
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  markAsRead: (roomId: string) => Promise<void>
  setCurrentRoom: (roomId: string | null) => void
  setSidebarOpen: (open: boolean) => void
  
  // Real-time event handlers
  handleNewMessage: (message: ChatMessage) => void
  handleUserOnline: (user: OnlineUser) => void
  handleUserOffline: (userId: string) => void
  handleTypingStart: (data: TypingStatus) => void
  handleTypingStop: (data: { roomId: string; userId: string }) => void
  
  // Utility functions
  getCurrentRoom: () => ChatRoom | null
  getCurrentMessages: () => ChatMessage[]
  getTotalUnreadCount: () => number
  searchMessages: (query: string) => ChatMessage[]
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    socket: null,
    isConnected: false,
    rooms: [],
    messages: {},
    onlineUsers: [],
    currentRoomId: null,
    typingUsers: [],
    isLoadingRooms: false,
    isLoadingMessages: false,
    isSidebarOpen: true,
    lastUpdate: new Date(),
    connectionAttempts: 0,

    // Initialize WebSocket connection
    initializeSocket: () => {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      })

      // Connection events
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id)
        set({ 
          socket, 
          isConnected: true, 
          connectionAttempts: 0,
          lastUpdate: new Date()
        })
        
        // Join user to their rooms
        get().rooms.forEach(room => {
          socket.emit('join-room', room.id)
        })
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason)
        set({ isConnected: false })
        
        // Attempt to reconnect
        if (reason === 'io server disconnect') {
          socket.connect()
        }
      })

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        set(state => ({ 
          connectionAttempts: state.connectionAttempts + 1 
        }))
      })

      // Chat events
      socket.on('new-message', (message: ChatMessage) => {
        get().handleNewMessage(message)
      })

      socket.on('user-online', (user: OnlineUser) => {
        get().handleUserOnline(user)
      })

      socket.on('user-offline', (userId: string) => {
        get().handleUserOffline(userId)
      })

      socket.on('typing-start', (data: TypingStatus) => {
        get().handleTypingStart(data)
      })

      socket.on('typing-stop', (data: { roomId: string; userId: string }) => {
        get().handleTypingStop(data)
      })

      socket.on('room-updated', () => {
        // Reload rooms when structure changes
        get().loadRooms()
      })

      set({ socket })
    },

    // Disconnect socket
    disconnectSocket: () => {
      const { socket } = get()
      if (socket) {
        socket.disconnect()
        set({ socket: null, isConnected: false })
      }
    },

    // Load rooms from database
    loadRooms: async () => {
      try {
        set({ isLoadingRooms: true })
        
        const response = await fetch('/api/chat/rooms')
        if (!response.ok) throw new Error('Failed to load rooms')
        
        const data = await response.json()
        const rooms = data.rooms || []
        
        set({ 
          rooms,
          lastUpdate: new Date()
        })
        
        console.log(`✅ Loaded ${rooms.length} chat rooms`)
        
        // Join rooms via socket
        const { socket } = get()
        if (socket && socket.connected) {
          rooms.forEach((room: ChatRoom) => {
            socket.emit('join-room', room.id)
          })
        }
        
      } catch (error) {
        console.error('❌ Failed to load rooms:', error)
      } finally {
        set({ isLoadingRooms: false })
      }
    },

    // Load messages for a room
    loadMessages: async (roomId: string) => {
      try {
        set({ isLoadingMessages: true })
        
        const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
        if (!response.ok) throw new Error('Failed to load messages')
        
        const data = await response.json()
        const messages = data.messages || []
        
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: messages
          },
          lastUpdate: new Date()
        }))
        
        console.log(`✅ Loaded ${messages.length} messages for room ${roomId}`)
        
        // Mark as read
        await get().markAsRead(roomId)
        
      } catch (error) {
        console.error(`❌ Failed to load messages for room ${roomId}:`, error)
      } finally {
        set({ isLoadingMessages: false })
      }
    },

    // Send message
    sendMessage: async (roomId: string, content: string, replyToId?: string) => {
      if (!content.trim()) return

      try {
        const { socket } = get()
        
        // Optimistic update - add message immediately
        const tempMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          content: content.trim(),
          type: 'TEXT',
          senderId: 'current-user', // Will be replaced by server
          roomId,
          replyToId,
          isEdited: false,
          createdAt: new Date(),
          sender: {
            id: 'current-user',
            name: 'You',
            email: '',
            isOnline: true
          }
        }

        // Add to local state immediately for responsiveness
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: [...(state.messages[roomId] || []), tempMessage]
          }
        }))

        // Send to server
        const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: content.trim(), 
            type: 'TEXT',
            replyToId 
          })
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()
        
        // Real-time broadcast via socket
        if (socket && socket.connected) {
          socket.emit('send-message', {
            roomId,
            content: content.trim(),
            type: 'TEXT',
            replyToId
          })
        }

        // Remove temp message and reload to get real message
        await get().loadMessages(roomId)
        
      } catch (error) {
        console.error('❌ Failed to send message:', error)
        
        // Remove failed temp message
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: (state.messages[roomId] || []).filter(msg => 
              !msg.id.startsWith('temp-')
            )
          }
        }))
      }
    },

    // Join room
    joinRoom: (roomId: string) => {
      const { socket } = get()
      if (socket && socket.connected) {
        socket.emit('join-room', roomId)
      }
    },

    // Leave room
    leaveRoom: (roomId: string) => {
      const { socket } = get()
      if (socket && socket.connected) {
        socket.emit('leave-room', roomId)
      }
    },

    // Mark room as read
    markAsRead: async (roomId: string) => {
      try {
        await fetch(`/api/chat/rooms/${roomId}/read`, {
          method: 'POST'
        })
        
        // Update local unread count
        set(state => ({
          rooms: state.rooms.map(room =>
            room.id === roomId 
              ? { ...room, unreadCount: 0 }
              : room
          )
        }))
        
      } catch (error) {
        console.error('❌ Failed to mark as read:', error)
      }
    },

    // Set current room
    setCurrentRoom: (roomId: string | null) => {
      const { currentRoomId } = get()
      
      // Leave previous room
      if (currentRoomId && currentRoomId !== roomId) {
        get().leaveRoom(currentRoomId)
      }
      
      // Join new room and load messages
      if (roomId) {
        get().joinRoom(roomId)
        get().loadMessages(roomId)
      }
      
      set({ currentRoomId: roomId })
    },

    // Set sidebar open state
    setSidebarOpen: (open: boolean) => {
      set({ isSidebarOpen: open })
    },

    // Handle new message from socket
    handleNewMessage: (message: ChatMessage) => {
      set(state => {
        const roomMessages = state.messages[message.roomId] || []
        
        // Avoid duplicates
        const exists = roomMessages.some(msg => msg.id === message.id)
        if (exists) return state

        return {
          messages: {
            ...state.messages,
            [message.roomId]: [...roomMessages, message]
          },
          rooms: state.rooms.map(room =>
            room.id === message.roomId
              ? {
                  ...room,
                  messageCount: room.messageCount + 1,
                  lastMessageAt: message.createdAt,
                  unreadCount: state.currentRoomId === message.roomId 
                    ? 0 
                    : room.unreadCount + 1
                }
              : room
          ),
          lastUpdate: new Date()
        }
      })
    },

    // Handle user coming online
    handleUserOnline: (user: OnlineUser) => {
      set(state => ({
        onlineUsers: [
          ...state.onlineUsers.filter(u => u.id !== user.id),
          user
        ]
      }))
    },

    // Handle user going offline
    handleUserOffline: (userId: string) => {
      set(state => ({
        onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
      }))
    },

    // Handle typing start
    handleTypingStart: (data: TypingStatus) => {
      set(state => ({
        typingUsers: [
          ...state.typingUsers.filter(t => 
            !(t.roomId === data.roomId && t.userId === data.userId)
          ),
          data
        ]
      }))
    },

    // Handle typing stop
    handleTypingStop: (data: { roomId: string; userId: string }) => {
      set(state => ({
        typingUsers: state.typingUsers.filter(t => 
          !(t.roomId === data.roomId && t.userId === data.userId)
        )
      }))
    },

    // Get current room
    getCurrentRoom: () => {
      const { rooms, currentRoomId } = get()
      return rooms.find(room => room.id === currentRoomId) || null
    },

    // Get current messages
    getCurrentMessages: () => {
      const { messages, currentRoomId } = get()
      return currentRoomId ? (messages[currentRoomId] || []) : []
    },

    // Get total unread count
    getTotalUnreadCount: () => {
      const { rooms } = get()
      return rooms.reduce((total, room) => total + room.unreadCount, 0)
    },

    // Search messages
    searchMessages: (query: string) => {
      const { messages } = get()
      const allMessages = Object.values(messages).flat()
      
      return allMessages.filter(message =>
        message.content.toLowerCase().includes(query.toLowerCase()) ||
        message.sender.name.toLowerCase().includes(query.toLowerCase())
      )
    }
  }))
)

// Initialize store on app start
if (typeof window !== 'undefined') {
  // Auto-initialize socket when store is created
  setTimeout(() => {
    useChatStore.getState().initializeSocket()
    useChatStore.getState().loadRooms()
  }, 1000)
}