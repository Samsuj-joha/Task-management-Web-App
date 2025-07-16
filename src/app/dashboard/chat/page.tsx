// src/app/dashboard/chat/page.tsx - COMPLETE FIXED VERSION
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  MessageCircle,
  Send,
  Users,
  Bell,
  Settings,
  Plus,
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Hash,
  Lock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Interfaces
interface ChatRoom {
  id: string
  name: string
  type: 'GENERAL' | 'PROJECT' | 'DIRECT' | 'ANNOUNCEMENT'
  isPrivate: boolean
  memberCount: number
  messageCount: number
  unreadCount: number
  lastMessageAt?: Date
  project?: {
    id: string
    name: string
    color?: string
  }
}

interface ChatMessage {
  id: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  senderId: string
  createdAt: Date
  isEdited: boolean
  sender: {
    id: string
    name: string
    email: string
    isOnline: boolean
  }
  replyTo?: {
    id: string
    content: string
    sender: { name: string }
  }
}

interface OnlineUser {
  id: string
  name: string
  email: string
  isOnline: boolean
  status: 'ACTIVE' | 'AWAY' | 'BUSY'
}

// Chat Sidebar Component
function ChatSidebar({ 
  rooms, 
  onlineUsers, 
  selectedRoom, 
  onRoomSelect, 
  isLoading,
  isSidebarOpen,
  onCloseSidebar 
}: {
  rooms: ChatRoom[]
  onlineUsers: OnlineUser[]
  selectedRoom: string | null
  onRoomSelect: (roomId: string) => void
  isLoading: boolean
  isSidebarOpen: boolean
  onCloseSidebar: () => void
}) {
  const getRoomIcon = (room: ChatRoom) => {
    switch (room.type) {
      case 'GENERAL': return <Hash className="h-4 w-4" />
      case 'PROJECT': return <Users className="h-4 w-4" />
      case 'DIRECT': return <MessageCircle className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Bell className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusColor = (status: OnlineUser['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'AWAY': return 'bg-yellow-500'
      case 'BUSY': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={cn(
      "w-80 border-r bg-background flex flex-col transition-transform duration-200",
      isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      "md:translate-x-0 absolute md:relative z-40 md:z-auto h-full"
    )}>
      {/* Sidebar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Team Chat
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {onlineUsers.length} online
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 md:hidden"
              onClick={onCloseSidebar}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Rooms List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-muted rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-muted rounded animate-pulse mb-1" />
                    <div className="w-16 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Channels ({rooms.length})</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      selectedRoom === room.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => onRoomSelect(room.id)}
                  >
                    <div className="flex-shrink-0">
                      {getRoomIcon(room)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">
                          {room.name}
                        </span>
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs h-5">
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{room.memberCount} members</span>
                        {room.isPrivate && <Lock className="h-3 w-3 ml-1" />}
                        {room.project && (
                          <span className="ml-1">• {room.project.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Online Users */}
              <div className="mb-4">
                <div className="px-2 py-1 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Online — {onlineUsers.length}
                  </span>
                </div>
                
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                        getStatusColor(user.status)
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Chat Main Area Component
function ChatMainArea({ 
  room, 
  messages, 
  isConnected, 
  isLoading, 
  onSendMessage,
  onToggleSidebar 
}: {
  room: ChatRoom | null
  messages: ChatMessage[]
  isConnected: boolean
  isLoading: boolean
  onSendMessage: (content: string) => void
  onToggleSidebar: () => void
}) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when room changes
  useEffect(() => {
    inputRef.current?.focus()
  }, [room])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (messageDate.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      return 'Yesterday'
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoomIcon = (room: ChatRoom) => {
    switch (room.type) {
      case 'GENERAL': return <Hash className="h-4 w-4" />
      case 'PROJECT': return <Users className="h-4 w-4" />
      case 'DIRECT': return <MessageCircle className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Bell className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Welcome to Team Chat</h3>
          <p className="text-muted-foreground mb-4">
            Select a channel from the sidebar to start chatting with your team.
          </p>
          <Button onClick={onToggleSidebar}>
            Browse Channels
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onToggleSidebar}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {getRoomIcon(room)}
              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {room.memberCount} members • {room.messageCount} messages
                  {room.project && (
                    <span className="ml-2">• {room.project.name}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 mt-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1]
              const showDate = !previousMessage || 
                formatDate(message.createdAt) !== formatDate(previousMessage.createdAt)
              const showSender = !previousMessage || 
                previousMessage.senderId !== message.senderId ||
                (message.createdAt.getTime() - previousMessage.createdAt.getTime()) > 300000 // 5 minutes
              
              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-muted px-3 py-1 rounded-full">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className={cn(
                    "flex gap-3",
                    message.senderId === 'current-user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    {/* Avatar (only show for first message in group) */}
                    {showSender && message.senderId !== 'current-user' ? (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(message.sender.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : message.senderId !== 'current-user' ? (
                      <div className="w-8" />
                    ) : null}

                    <div className={cn(
                      "flex flex-col max-w-[70%]",
                      message.senderId === 'current-user' ? "items-end" : "items-start"
                    )}>
                      {/* Sender name and time (only for first message in group) */}
                      {showSender && (
                        <div className={cn(
                          "flex items-center gap-2 mb-1",
                          message.senderId === 'current-user' ? "flex-row-reverse" : "flex-row"
                        )}>
                          <span className="text-sm font-medium">
                            {message.senderId === 'current-user' ? 'You' : message.sender.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                          )}
                        </div>
                      )}

                      {/* Reply indicator */}
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary text-sm">
                          <p className="text-xs text-muted-foreground mb-1">
                            Replying to {message.replyTo.sender.name}
                          </p>
                          <p className="text-muted-foreground">
                            {message.replyTo.content.substring(0, 100)}...
                          </p>
                        </div>
                      )}

                      {/* Message content */}
                      <div className={cn(
                        "px-3 py-2 rounded-lg break-words",
                        message.type === 'SYSTEM' 
                          ? "bg-muted/50 text-muted-foreground italic text-center"
                          : message.senderId === 'current-user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>

                      {/* Time for subsequent messages */}
                      {!showSender && message.type !== 'SYSTEM' && (
                        <span className="text-xs text-muted-foreground mt-1 px-1">
                          {formatTime(message.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${room.name}...`}
              className="pr-20"
              disabled={!isConnected}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || !isConnected}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Typing indicator placeholder */}
        <div className="mt-2 min-h-[1rem]">
          {/* Will show typing indicators here later */}
        </div>
      </div>
    </div>
  )
}

// Main Chat Page Component
export default function ChatPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialRoomId = searchParams.get('room')
  
  const [selectedRoom, setSelectedRoom] = useState<string | null>(initialRoomId)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // Load rooms from database
  useEffect(() => {
    if (session?.user) {
      loadRooms()
    }
  }, [session])

  // Load messages when room changes
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom)
    }
  }, [selectedRoom])

  const loadRooms = async () => {
    try {
      setIsLoadingRooms(true)
      const response = await fetch('/api/chat/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms || [])
        console.log('✅ Loaded rooms:', data.rooms?.length || 0)
      } else {
        console.error('Failed to load rooms:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to load rooms:', error)
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        console.log('✅ Loaded messages:', data.messages?.length || 0)
      } else {
        console.error('Failed to load messages:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!selectedRoom || !content.trim()) return

    try {
      const response = await fetch(`/api/chat/rooms/${selectedRoom}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'TEXT' })
      })

      if (response.ok) {
        // Reload messages to show the new one
        loadMessages(selectedRoom)
      } else {
        console.error('Failed to send message:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId)
    router.push(`/dashboard/chat?room=${roomId}`)
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const currentRoom = rooms.find(room => room.id === selectedRoom)

  // Simulate connection (will be real WebSocket later)
  useEffect(() => {
    setIsConnected(true)
    // Mock some online users
    setOnlineUsers([
      { id: '1', name: 'John Doe', email: 'john@company.com', isOnline: true, status: 'ACTIVE' },
      { id: '2', name: 'Sarah Wilson', email: 'sarah@company.com', isOnline: true, status: 'ACTIVE' },
      { id: '3', name: 'Mike Johnson', email: 'mike@company.com', isOnline: true, status: 'AWAY' }
    ])
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <ChatSidebar
        rooms={rooms}
        onlineUsers={onlineUsers}
        selectedRoom={selectedRoom}
        onRoomSelect={handleRoomSelect}
        isLoading={isLoadingRooms}
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <ChatMainArea
        room={currentRoom || null}
        messages={messages}
        isConnected={isConnected}
        isLoading={isLoadingMessages}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}