// src/app/dashboard/chat/direct/[userId]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  Mic,
  UserCheck,
  Clock,
  CheckCheck,
  Circle,
  AlertCircle,
  Settings
} from 'lucide-react'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  timestamp: Date
  isRead: boolean
  messageType: 'text' | 'image' | 'file' | 'audio'
  fileUrl?: string
  fileName?: string
  isEdited?: boolean
  editedAt?: Date
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'online' | 'away' | 'offline'
  lastSeen?: Date
  role?: string
  department?: string
}

export default function DirectChatPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const userId = params.userId as string
  const currentUserId = session?.user?.id || 'current-user'
  
  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [recipient, setRecipient] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const loadChatData = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock recipient data
      const mockRecipient: User = {
        id: userId,
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        avatar: null,
        status: 'online',
        lastSeen: new Date(),
        role: 'Senior Developer',
        department: 'Engineering'
      }
      
      // Mock messages
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hey! How are you doing with the authentication task?',
          senderId: userId,
          receiverId: currentUserId,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isRead: true,
          messageType: 'text'
        },
        {
          id: '2',
          content: 'I\'m making good progress! Just working through the OAuth integration.',
          senderId: currentUserId,
          receiverId: userId,
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
          isRead: true,
          messageType: 'text'
        },
        {
          id: '3',
          content: 'That\'s great! Let me know if you need any help with the configuration.',
          senderId: userId,
          receiverId: currentUserId,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          isRead: true,
          messageType: 'text'
        },
        {
          id: '4',
          content: 'Actually, could you review this implementation when you have a moment?',
          senderId: currentUserId,
          receiverId: userId,
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          isRead: false,
          messageType: 'text'
        }
      ]
      
      setRecipient(mockRecipient)
      setMessages(mockMessages)
      setIsLoading(false)
    }
    
    loadChatData()
  }, [userId, currentUserId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const formatMessageTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'HH:mm')
    } else if (isYesterday(timestamp)) {
      return `Yesterday ${format(timestamp, 'HH:mm')}`
    } else {
      return format(timestamp, 'MMM dd, HH:mm')
    }
  }

  const getLastSeenText = (lastSeen?: Date) => {
    if (!lastSeen) return 'Last seen a while ago'
    if (isToday(lastSeen)) {
      return `Last seen ${format(lastSeen, 'HH:mm')}`
    }
    return `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return
    
    setIsSending(true)
    
    try {
      const message: Message = {
        id: `msg-${Date.now()}`,
        content: newMessage.trim(),
        senderId: currentUserId,
        receiverId: userId,
        timestamp: new Date(),
        isRead: false,
        messageType: 'text'
      }
      
      // Optimistically add message
      setMessages(prev => [...prev, message])
      setNewMessage('')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mark as sent (in real app, this would come from server)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, isRead: false } 
            : msg
        )
      )
      
      toast.success('Message sent')
    } catch (error) {
      toast.error('Failed to send message')
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className="h-12 w-64 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!recipient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-500 mb-4">The user you're trying to chat with could not be found.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback>
                  {getInitials(recipient.name)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(recipient.status)} rounded-full border-2 border-white`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {recipient.name}
              </h2>
              <p className="text-sm text-gray-500 truncate">
                {recipient.status === 'online' 
                  ? 'Online' 
                  : getLastSeenText(recipient.lastSeen)
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId
            const showTimestamp = index === 0 || 
              (messages[index - 1] && 
               new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000)
            
            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="text-center my-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isOwnMessage && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={recipient.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(recipient.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.isEdited && (
                        <p className="text-xs opacity-70 mt-1">edited</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {format(message.timestamp, 'HH:mm')}
                      </span>
                      {isOwnMessage && (
                        <div className="text-blue-600">
                          {message.isRead ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {isTyping && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={recipient.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(recipient.name)}
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="icon" className="mb-2">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12 resize-none"
                disabled={isSending}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="mb-2"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}