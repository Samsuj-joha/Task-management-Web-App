// src/hooks/use-socket.ts - REAL ACTIVE USERS VERSION
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { io, Socket } from 'socket.io-client'

interface OnlineUser {
  userId: string
  name: string
  email?: string
  socketId: string
  joinedAt: Date
  lastActive: Date
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  taskId?: string
  projectId?: string
  userId?: string
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  reconnect: () => void
  onlineUsers: OnlineUser[]
  notifications: Notification[]
  notificationCount: number
  onlineCount: number
  clearNotifications: () => void
}

export function useSocket(): UseSocketReturn {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const connectionAttempts = useRef(0)
  const maxRetries = 3
  const reconnectTimeout = useRef<NodeJS.Timeout>()

  // Check if socket should be enabled
  const shouldEnableSocket = process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true'

  // Fetch real active users from database
  const fetchActiveUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users/active')
      if (response.ok) {
        const data = await response.json()
        const activeUsers: OnlineUser[] = data.users?.map((user: any) => ({
          userId: user.id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          email: user.email,
          socketId: `socket-${user.id}`,
          joinedAt: new Date(user.lastActive || user.createdAt),
          lastActive: new Date(user.lastActive || new Date())
        })) || []
        
        setOnlineUsers(activeUsers)
        setIsConnected(true) // Show as connected for demo
        setConnectionStatus('connected')
        
        console.log(`👥 Loaded ${activeUsers.length} active users from database`)
      }
    } catch (error) {
      console.error('Failed to fetch active users:', error)
      // Fallback: show current user only
      if (session?.user) {
        const currentUser: OnlineUser = {
          userId: session.user.id || 'current',
          name: session.user.name || 'You',
          email: session.user.email || '',
          socketId: 'socket-current',
          joinedAt: new Date(),
          lastActive: new Date()
        }
        setOnlineUsers([currentUser])
      }
    }
  }, [session])

  // Load sample notifications from API
  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
      // Show empty notifications instead of static data
      setNotifications([])
    }
  }, [])

  // Initialize data
  useEffect(() => {
    if (session?.user) {
      fetchActiveUsers()
      loadNotifications()

      // Refresh active users every 30 seconds
      const userInterval = setInterval(fetchActiveUsers, 30000)
      
      // Refresh notifications every 60 seconds
      const notificationInterval = setInterval(loadNotifications, 60000)

      return () => {
        clearInterval(userInterval)
        clearInterval(notificationInterval)
      }
    }
  }, [session, fetchActiveUsers, loadNotifications])

  const initializeSocket = useCallback(() => {
    // Only try real socket if enabled
    if (!shouldEnableSocket) {
      console.log('🔧 Socket.IO disabled - using database data for active users')
      return
    }

    connectionAttempts.current += 1
    console.log(`🔌 Attempting Socket.IO connection (attempt ${connectionAttempts.current})...`)
    
    setConnectionStatus('connecting')

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
      retries: 3,
      autoConnect: true,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    })

    // Connection successful
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected successfully')
      console.log(`📋 Socket ID: ${newSocket.id}`)
      setIsConnected(true)
      setConnectionStatus('connected')
      connectionAttempts.current = 0

      // Join user to online users
      if (session?.user) {
        newSocket.emit('user_online', {
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email
        })
      }
    })

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.warn(`⚠️ Socket.IO connection error (attempt ${connectionAttempts.current}):`, error.message)
      setIsConnected(false)
      setConnectionStatus('error')

      if (connectionAttempts.current >= maxRetries) {
        console.log('❌ Max Socket.IO connection attempts reached. Using database fallback.')
        newSocket.disconnect()
        setConnectionStatus('disconnected')
        return
      }

      reconnectTimeout.current = setTimeout(() => {
        console.log('🔄 Retrying Socket.IO connection...')
        initializeSocket()
      }, 2000 * connectionAttempts.current)
    })

    // Real socket event handlers
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      
      // Don't clear users - keep database data
      // setOnlineUsers([])
    })

    newSocket.on('online_users_update', (users: OnlineUser[]) => {
      console.log('👥 Online users updated via Socket.IO:', users.length)
      setOnlineUsers(users || [])
    })

    newSocket.on('user_joined', (user: OnlineUser) => {
      console.log('👤 User joined:', user.name)
      setOnlineUsers(prev => {
        // Avoid duplicates
        const filtered = prev.filter(u => u.userId !== user.userId)
        return [...filtered, user]
      })
    })

    newSocket.on('user_left', (userId: string) => {
      console.log('👤 User left:', userId)
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId))
    })

    newSocket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification)
      setNotifications(prev => [notification, ...prev.slice(0, 49)])
    })

    setSocket(newSocket)
    return newSocket
  }, [shouldEnableSocket, session])

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }
    connectionAttempts.current = 0
    if (shouldEnableSocket) {
      initializeSocket()
    } else {
      fetchActiveUsers()
    }
  }, [socket, initializeSocket, shouldEnableSocket, fetchActiveUsers])

  const clearNotifications = useCallback(() => {
    setNotifications([])
    console.log('🧹 Notifications cleared')
  }, [])

  useEffect(() => {
    if (shouldEnableSocket && session?.user) {
      const socketInstance = initializeSocket()

      return () => {
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current)
        }
        if (socketInstance) {
          // Notify server user is going offline
          socketInstance.emit('user_offline', session.user.id)
          console.log('🧹 Cleaning up Socket.IO connection')
          socketInstance.disconnect()
        }
      }
    }
  }, [initializeSocket, shouldEnableSocket, session])

  // Calculate derived values
  const notificationCount = notifications.length
  const onlineCount = onlineUsers.length

  return {
    socket,
    isConnected,
    connectionStatus,
    reconnect,
    onlineUsers,
    notifications,
    notificationCount,
    onlineCount,
    clearNotifications
  }
}