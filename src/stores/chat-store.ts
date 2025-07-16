// src/stores/chat-store.ts - REAL DATABASE VERSION
import { create } from 'zustand'
import { Socket } from 'socket.io-client'

interface ChatStore {
  // Connection
  socket: Socket | null
  isConnected: boolean
  
  // Dynamic data from database
  rooms: ChatRoom[]
  messages: Record<string, ChatMessage[]> // roomId -> messages
  onlineUsers: User[]
  currentRoom: string | null
  
  // Loading states
  isLoadingRooms: boolean
  isLoadingMessages: boolean
  
  // Actions - all fetch from database
  setSocket: (socket: Socket | null) => void
  loadRooms: () => Promise<void>
  loadMessages: (roomId: string) => Promise<void>
  sendMessage: (roomId: string, content: string) => Promise<void>
  updateOnlineUsers: (users: User[]) => void
  addMessage: (message: ChatMessage) => void
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  socket: null,
  isConnected: false,
  rooms: [],
  messages: {},
  onlineUsers: [],
  currentRoom: null,
  isLoadingRooms: false,
  isLoadingMessages: false,
  
  // Actions
  setSocket: (socket) => set({ 
    socket, 
    isConnected: socket?.connected || false 
  }),
  
  // Load rooms from database
  loadRooms: async () => {
    set({ isLoadingRooms: true })
    try {
      const response = await fetch('/api/chat/rooms')
      if (response.ok) {
        const data = await response.json()
        set({ rooms: data.rooms || [] })
      }
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      set({ isLoadingRooms: false })
    }
  },
  
  // Load messages from database
  loadMessages: async (roomId: string) => {
    set({ isLoadingMessages: true })
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (response.ok) {
        const data = await response.json()
        set(state => ({
          messages: {
            ...state.messages,
            [roomId]: data.messages || []
          }
        }))
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      set({ isLoadingMessages: false })
    }
  },
  
  // Send message to database
  sendMessage: async (roomId: string, content: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'TEXT' })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Real-time update via WebSocket
        get().socket?.emit('send-message', {
          roomId,
          content,
          type: 'TEXT'
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  },
  
  // Real-time updates
  updateOnlineUsers: (users) => set({ onlineUsers: users }),
  addMessage: (message) => set(state => ({
    messages: {
      ...state.messages,
      [message.roomId]: [...(state.messages[message.roomId] || []), message]
    }
  }))
}))