// server/socket-server.js (CORRECTED VERSION)
const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

console.log(`🔧 Environment: ${dev ? 'DEVELOPMENT' : 'PRODUCTION'}`)
console.log(`🌐 Hostname: ${hostname}`)
console.log(`🚪 Port: ${port}`)

// Create Next.js app
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

// Prepare Next.js
app.prepare().then(() => {
  console.log('✅ Next.js prepared successfully')

  // Create HTTP server
  const httpServer = createServer((req, res) => {
    // Handle Socket.IO test endpoint
    if (req.url === '/api/socket-test' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        message: 'Socket.IO server is running',
        timestamp: new Date(),
        connectedClients: io.sockets.sockets.size,
        transport: 'websocket,polling'
      }))
      return
    }

    // Handle health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'OK',
        server: 'Socket.IO + Next.js',
        timestamp: new Date()
      }))
      return
    }

    // Handle all other requests with Next.js
    return handler(req, res)
  })

  // Create Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001"
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowEIO3: true,
    cookie: false
  })

  console.log('✅ Socket.IO server created')

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('🔌 Socket.IO: New connection established')
    console.log(`   📋 Socket ID: ${socket.id}`)
    console.log(`   🌐 Transport: ${socket.conn.transport.name}`)
    console.log(`   📊 Total connections: ${io.sockets.sockets.size}`)
    
    // Send immediate confirmation
    socket.emit('connection-confirmed', {
      socketId: socket.id,
      message: 'Socket.IO connection successful!',
      timestamp: new Date(),
      server: 'TaskFlow Socket Server'
    })

    // Handle user join
    socket.on('user-join', (userData) => {
      console.log(`👤 User joined: ${userData.name} (${userData.userId})`)
      socket.userId = userData.userId
      socket.userName = userData.name
      
      // Broadcast user online status
      socket.broadcast.emit('user-online', {
        userId: userData.userId,
        name: userData.name,
        timestamp: new Date()
      })
    })

    // Handle task events
    socket.on('task-created', (taskData) => {
      console.log('📝 Task created:', taskData.title || taskData.name)
      
      // Broadcast to all clients
      io.emit('task-created-notification', {
        id: `task-${Date.now()}`,
        type: 'task_created',
        title: 'New Task Created',
        message: `${socket.userName || 'Someone'} created task "${taskData.title || taskData.name}"`,
        taskId: taskData.id,
        createdBy: socket.userId,
        timestamp: new Date()
      })
    })

    socket.on('task-status-changed', (data) => {
      console.log('🔄 Task status changed:', data)
      
      io.emit('task-status-notification', {
        id: `status-${Date.now()}`,
        type: 'task_status_changed',
        title: 'Task Status Updated',
        message: `${socket.userName || 'Someone'} changed task "${data.taskName}" to ${data.newStatus}`,
        taskId: data.taskId,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        updatedBy: socket.userId,
        timestamp: new Date()
      })
    })

    socket.on('task-assigned', (data) => {
      console.log('👤 Task assigned:', data)
      
      // Send notification to assigned user specifically
      io.emit('task-assigned-notification', {
        id: `assign-${Date.now()}`,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task "${data.taskName}"`,
        taskId: data.taskId,
        assignedBy: socket.userId,
        timestamp: new Date()
      })
    })

    // Handle chat events
    socket.on('join-room', (roomId) => {
      socket.join(roomId)
      console.log(`💬 User ${socket.userName} joined room ${roomId}`)
      
      socket.to(roomId).emit('user-joined-room', {
        userId: socket.userId,
        userName: socket.userName,
        roomId: roomId
      })
    })

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId)
      console.log(`💬 User ${socket.userName} left room ${roomId}`)
      
      socket.to(roomId).emit('user-left-room', {
        userId: socket.userId,
        userName: socket.userName,
        roomId: roomId
      })
    })

    socket.on('send-message', (messageData) => {
      console.log('💌 Message sent:', messageData)
      
      const message = {
        id: `msg-${Date.now()}`,
        content: messageData.content,
        senderId: socket.userId,
        senderName: socket.userName,
        roomId: messageData.roomId,
        timestamp: new Date(),
        type: messageData.type || 'text'
      }

      // Send to all users in the room
      io.to(messageData.roomId).emit('new-message', message)
    })

    socket.on('send-private-message', (data) => {
      console.log('🔒 Private message:', data)
      
      const message = {
        id: `pm-${Date.now()}`,
        content: data.content,
        senderId: socket.userId,
        senderName: socket.userName,
        receiverId: data.receiverId,
        timestamp: new Date(),
        type: 'private'
      }

      // Find receiver's socket and send message
      const receiverSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.userId === data.receiverId)

      if (receiverSocket) {
        receiverSocket.emit('new-private-message', message)
        receiverSocket.emit('private-message-notification', {
          id: `pm-notif-${Date.now()}`,
          type: 'private_message',
          title: 'New Private Message',
          message: `${socket.userName} sent you a message`,
          senderId: socket.userId,
          timestamp: new Date()
        })
      }

      // Confirm to sender
      socket.emit('message-sent', { messageId: message.id, status: 'delivered' })
    })

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.userName,
        roomId: data.roomId
      })
    })

    socket.on('typing-stop', (data) => {
      socket.to(data.roomId).emit('user-stop-typing', {
        userId: socket.userId,
        roomId: data.roomId
      })
    })

    // Project events
    socket.on('project-created', (projectData) => {
      console.log('📁 Project created:', projectData.name)
      
      io.emit('project-created-notification', {
        id: `project-${Date.now()}`,
        type: 'project_created',
        title: 'New Project Created',
        message: `${socket.userName || 'Someone'} created project "${projectData.name}"`,
        projectId: projectData.id,
        createdBy: socket.userId,
        timestamp: new Date()
      })
    })

    // Test events
    socket.on('test-message', (data) => {
      console.log('📧 Test message received:', data)
      socket.emit('test-response', {
        received: data,
        timestamp: new Date(),
        socketId: socket.id
      })
    })

    // Ping-pong for connection testing
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() })
    })

    // User activity ping
    socket.on('user-active', () => {
      // Update user's last active timestamp
      console.log(`🏃 User ${socket.userName} is active`)
    })

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO: Client disconnected')
      console.log(`   📋 Socket ID: ${socket.id}`)
      console.log(`   📝 Reason: ${reason}`)
      console.log(`   📊 Remaining connections: ${io.sockets.sockets.size}`)
      
      if (socket.userId) {
        socket.broadcast.emit('user-offline', {
          userId: socket.userId,
          timestamp: new Date()
        })
      }
    })

    // Error handler
    socket.on('error', (error) => {
      console.error('❌ Socket.IO Error:', error)
    })
  })

  // Start the server
  httpServer.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Failed to start server:', err)
      process.exit(1)
    }
    
    console.log('')
    console.log('🎉 TaskFlow Server Started Successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`🌐 Next.js App:      http://${hostname}:${port}`)
    console.log(`🔌 Socket.IO:        http://${hostname}:${port}/socket.io/`)
    console.log(`🏥 Health Check:     http://${hostname}:${port}/health`)
    console.log(`🧪 Socket Test:      http://${hostname}:${port}/api/socket-test`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('✅ Ready to accept connections!')
  })

  // Server error handler
  httpServer.on('error', (error) => {
    console.error('❌ HTTP Server Error:', error)
    
    if (error.code === 'EADDRINUSE') {
      console.error(`⚠️  Port ${port} is already in use!`)
      console.log('💡 Solutions:')
      console.log('   1. Kill existing process: npx kill-port 3000')
      console.log('   2. Use different port: PORT=3001 npm run dev')
      console.log('   3. Check running processes: lsof -i :3000')
    }
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully')
    httpServer.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully')
    httpServer.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })

}).catch((error) => {
  console.error('❌ Failed to prepare Next.js:', error)
  console.log('💡 Possible causes:')
  console.log('   1. Invalid route configuration in Next.js')
  console.log('   2. Missing dependencies')
  console.log('   3. Port already in use')
  process.exit(1)
})