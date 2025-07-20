// // src/hooks/use-socket.ts (FIXED VERSION)
// 'use client'

// import { useEffect, useRef, useState, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
// import { io, Socket } from 'socket.io-client'
// import { toast } from 'sonner'

// export function useSocket() {
//   const { data: session } = useSession()
//   const [socket, setSocket] = useState<Socket | null>(null)
//   const [isConnected, setIsConnected] = useState(false)
//   const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
//   const [notifications, setNotifications] = useState<any[]>([])
//   const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  
//   const socketRef = useRef<Socket | null>(null)
//   const connectionAttempts = useRef(0)
//   const maxAttempts = 3

//   // Initialize Socket.IO connection
//   const initializeSocket = useCallback(() => {
//     if (!session?.user || socketRef.current?.connected) {
//       console.log('❌ Cannot initialize: No session or already connected')
//       return
//     }

//     console.log('🔌 Initializing Socket.IO connection...')
//     setConnectionStatus('connecting')
//     connectionAttempts.current++

//     // Clean up any existing socket
//     if (socketRef.current) {
//       socketRef.current.disconnect()
//       socketRef.current = null
//     }

//     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
//     console.log(`🔗 Connecting to: ${socketUrl}`)

//     const newSocket = io(socketUrl, {
//       transports: ['websocket', 'polling'],
//       timeout: 10000,           // Reduced timeout
//       forceNew: true,
//       reconnection: false,      // Disable auto-reconnection for now
//       upgrade: true,
//       rememberUpgrade: false
//     })

//     socketRef.current = newSocket

//     // Connection success
//     newSocket.on('connect', () => {
//       console.log('✅ Socket.IO connected successfully!')
//       console.log(`   📋 Socket ID: ${newSocket.id}`)
//       console.log(`   🌐 Transport: ${newSocket.io.engine.transport.name}`)
      
//       setIsConnected(true)
//       setConnectionStatus('connected')
//       connectionAttempts.current = 0

//       // Send user info
//       newSocket.emit('user-join', {
//         userId: session.user.id,
//         name: session.user.name || 'Unknown User',
//         email: session.user.email || ''
//       })

//       toast.success('🔌 Real-time connection established!', {
//         description: 'You are now connected to live updates.',
//         duration: 3000
//       })
//     })

//     // Connection confirmed from server
//     newSocket.on('connection-confirmed', (data) => {
//       console.log('✅ Server confirmed connection:', data)
//     })

//     // Connection error
//     newSocket.on('connect_error', (error) => {
//       console.error(`❌ Socket.IO connection error (attempt ${connectionAttempts.current}):`, error.message)
//       setIsConnected(false)
//       setConnectionStatus('error')

//       if (connectionAttempts.current < maxAttempts) {
//         console.log(`🔄 Retrying connection in 3 seconds... (${connectionAttempts.current}/${maxAttempts})`)
//         setTimeout(() => {
//           initializeSocket()
//         }, 3000)
//       } else {
//         console.log('❌ Max connection attempts reached. Switching to fallback mode.')
//         toast.error('❌ Real-time connection failed', {
//           description: 'Working in offline mode. Some features may be limited.',
//           duration: 5000
//         })
//       }
//     })

//     // Disconnect
//     newSocket.on('disconnect', (reason) => {
//       console.log('❌ Socket.IO disconnected:', reason)
//       setIsConnected(false)
//       setConnectionStatus('disconnected')
//     })

//     // Test ping-pong
//     const pingInterval = setInterval(() => {
//       if (newSocket.connected) {
//         newSocket.emit('ping')
//       }
//     }, 30000)

//     newSocket.on('pong', (data) => {
//       console.log('🏓 Ping-pong successful:', data.timestamp)
//     })

//     // User presence events
//     newSocket.on('user-online', (data) => {
//       console.log('🟢 User came online:', data.name)
//       setOnlineUsers(prev => [...prev.filter(u => u.userId !== data.userId), data])
//     })

//     newSocket.on('user-offline', (data) => {
//       console.log('🔴 User went offline:', data.userId)
//       setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId))
//     })

//     setSocket(newSocket)

//     // Cleanup function
//     return () => {
//       clearInterval(pingInterval)
//       if (newSocket) {
//         newSocket.disconnect()
//       }
//       socketRef.current = null
//     }
//   }, [session])

//   // Test connection function
//   const testConnection = useCallback(async () => {
//     try {
//       console.log('🧪 Testing Socket.IO server...')
      
//       // Test if server is reachable
//       const response = await fetch('/api/socket-test')
//       if (response.ok) {
//         const data = await response.json()
//         console.log('✅ Server test successful:', data)
//         return true
//       } else {
//         console.error('❌ Server test failed:', response.status)
//         return false
//       }
//     } catch (error) {
//       console.error('❌ Server test error:', error)
//       return false
//     }
//   }, [])

//   // Initialize when session is available
//   useEffect(() => {
//     if (session?.user) {
//       console.log('👤 Session available, testing connection...')
      
//       testConnection().then(serverReachable => {
//         if (serverReachable) {
//           console.log('✅ Server is reachable, initializing socket...')
//           const cleanup = initializeSocket()
//           return cleanup
//         } else {
//           console.log('❌ Server is not reachable')
//           toast.error('❌ Real-time server not available', {
//             description: 'Please ensure the server is running.',
//             duration: 5000
//           })
//         }
//       })
//     }
//   }, [session, testConnection, initializeSocket])

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (socketRef.current) {
//         console.log('🧹 Cleaning up socket connection')
//         socketRef.current.disconnect()
//         socketRef.current = null
//       }
//     }
//   }, [])

//   // Emit functions
//   const emitTaskCreated = useCallback((data: any) => {
//     if (socket?.connected) {
//       console.log('📤 Emitting task-created:', data)
//       socket.emit('task-created', data)
//     } else {
//       console.log('❌ Cannot emit: Socket not connected')
//     }
//   }, [socket])

//   return {
//     socket,
//     isConnected,
//     connectionStatus,
//     notifications,
//     onlineUsers,
//     onlineCount: onlineUsers.length,
//     notificationCount: notifications.length,
    
//     // Methods
//     emitTaskCreated,
//     testConnection,
    
//     // Utils
//     clearNotifications: () => setNotifications([]),
//     clearMessages: () => setOnlineUsers([])
//   }
// }



// src/hooks/use-socket.ts - FIXED VERSION with all required properties
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface OnlineUser {
  userId: string
  name: string
  socketId: string
  joinedAt: Date
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
  // Additional properties expected by Header
  onlineUsers: OnlineUser[]
  notifications: Notification[]
  notificationCount: number
  onlineCount: number
  clearNotifications: () => void
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const connectionAttempts = useRef(0)
  const maxRetries = 3
  const reconnectTimeout = useRef<NodeJS.Timeout>()

  // Check if socket should be enabled
  const shouldEnableSocket = process.env.NEXT_PUBLIC_ENABLE_SOCKET === 'true' || 
                            process.env.NODE_ENV === 'production'

  const initializeSocket = useCallback(() => {
    // Skip socket connection if disabled
    if (!shouldEnableSocket) {
      console.log('🔧 Socket.IO disabled via environment variable')
      setConnectionStatus('disconnected')
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
      connectionAttempts.current = 0 // Reset attempts on success
    })

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.warn(`⚠️ Socket.IO connection error (attempt ${connectionAttempts.current}):`, error.message)
      setIsConnected(false)
      setConnectionStatus('error')

      // Don't retry if we've exceeded max attempts
      if (connectionAttempts.current >= maxRetries) {
        console.log('❌ Max Socket.IO connection attempts reached. Socket disabled.')
        newSocket.disconnect()
        setConnectionStatus('disconnected')
        return
      }

      // Retry after delay
      reconnectTimeout.current = setTimeout(() => {
        console.log('🔄 Retrying Socket.IO connection...')
        initializeSocket()
      }, 2000 * connectionAttempts.current) // Exponential backoff
    })

    // Disconnection
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason)
      setIsConnected(false)
      setConnectionStatus('disconnected')
      setOnlineUsers([]) // Clear online users on disconnect
      
      // Only auto-reconnect for certain reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return
      }
    })

    // Listen for online users updates
    newSocket.on('online_users_update', (users: OnlineUser[]) => {
      console.log('👥 Online users updated:', users.length)
      setOnlineUsers(users || [])
    })

    // Listen for notifications
    newSocket.on('notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification)
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
    })

    // Reconnection attempt
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket.IO reconnection attempt ${attemptNumber}`)
      setConnectionStatus('connecting')
    })

    // Reconnection successful
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket.IO reconnected after ${attemptNumber} attempts`)
      setIsConnected(true)
      setConnectionStatus('connected')
      connectionAttempts.current = 0
    })

    // Reconnection failed
    newSocket.on('reconnect_failed', () => {
      console.log('❌ Socket.IO reconnection failed')
      setIsConnected(false)
      setConnectionStatus('error')
    })

    setSocket(newSocket)
    return newSocket
  }, [shouldEnableSocket])

  const reconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }
    connectionAttempts.current = 0
    initializeSocket()
  }, [socket, initializeSocket])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  useEffect(() => {
    if (shouldEnableSocket) {
      const socketInstance = initializeSocket()

      return () => {
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current)
        }
        if (socketInstance) {
          console.log('🧹 Cleaning up Socket.IO connection')
          socketInstance.disconnect()
        }
      }
    } else {
      console.log('🔧 Socket.IO disabled - returning empty data')
      setConnectionStatus('disconnected')
      setIsConnected(false)
      setOnlineUsers([])
      setNotifications([])
    }
  }, [initializeSocket, shouldEnableSocket])

  // Calculate derived values
  const notificationCount = notifications.length
  const onlineCount = onlineUsers.length

  return {
    socket,
    isConnected,
    connectionStatus,
    reconnect,
    // Required by Header component
    onlineUsers,
    notifications,
    notificationCount,
    onlineCount,
    clearNotifications
  }
}