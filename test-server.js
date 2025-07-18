// test-server.js (Create this file in root for testing)
const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express()
const httpServer = createServer(app)

// Basic Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Basic test route
app.get('/', (req, res) => {
  res.send(`
    <h1>Socket.IO Test Server</h1>
    <p>Server is running on port 3001</p>
    <script src="/socket.io/socket.io.js"></script>
    <script>
      const socket = io();
      socket.on('connect', () => {
        console.log('✅ Connected to test server:', socket.id);
        document.body.innerHTML += '<p style="color: green;">✅ Socket.IO Connected!</p>';
      });
      socket.on('disconnect', () => {
        console.log('❌ Disconnected from test server');
        document.body.innerHTML += '<p style="color: red;">❌ Socket.IO Disconnected!</p>';
      });
      socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        document.body.innerHTML += '<p style="color: red;">❌ Connection Error: ' + error + '</p>';
      });
    </script>
  `)
})

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('✅ Test Server: Client connected:', socket.id)
  
  // Send welcome message
  socket.emit('welcome', {
    message: 'Welcome to Socket.IO test server!',
    timestamp: new Date()
  })
  
  socket.on('disconnect', () => {
    console.log('❌ Test Server: Client disconnected:', socket.id)
  })
})

// Start server
const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO Test Server running on http://localhost:${PORT}`)
  console.log(`🔌 Socket.IO endpoint: http://localhost:${PORT}/socket.io/`)
  console.log(`📋 Test page: http://localhost:${PORT}`)
})

// Error handling
httpServer.on('error', (error) => {
  console.error('❌ Server Error:', error)
  if (error.code === 'EADDRINUSE') {
    console.log(`⚠️  Port ${PORT} is already in use. Try a different port.`)
  }
})