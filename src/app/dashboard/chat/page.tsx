// src/app/dashboard/chat/page.tsx - FACEBOOK STYLE CHAT
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
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Loader2,
  ArrowLeft,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Interfaces
interface AppUser {
  id: string
  name: string
  email: string
  image?: string
  isOnline: boolean
  lastSeen?: string
  department?: string
  role: string
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: {
    id: string
    name: string
    image?: string
  }
}

interface PrivateChat {
  id: string
  otherUser: AppUser
  unreadCount: number
  lastMessage?: string
  lastMessageAt?: string
}

// Facebook Style Sidebar Component
function FacebookChatSidebar({ 
  allUsers, 
  onlineUsers,
  privateChatId,
  onGroupChatSelect,
  onPrivateChatSelect,
  onDeleteDatabase,
  isLoading
}: {
  allUsers: AppUser[]
  onlineUsers: AppUser[]
  privateChatId: string | null
  onGroupChatSelect: () => void
  onPrivateChatSelect: (userId: string) => void
  onDeleteDatabase: () => void
  isLoading: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session } = useSession()
  
  const filteredUsers = allUsers.filter(user => 
    user.id !== session?.user?.id &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineUsersFiltered = onlineUsers.filter(user => 
    user.id !== session?.user?.id &&
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const offlineUsersFiltered = filteredUsers.filter(user => !user.isOnline)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getLastSeenText = (user: AppUser) => {
    if (user.isOnline) return 'Active now'
    if (!user.lastSeen) return 'Offline'
    
    try {
      const lastSeen = new Date(user.lastSeen)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `Active ${diffMinutes}m ago`
      if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)}h ago`
      return `Active ${Math.floor(diffMinutes / 1440)}d ago`
    } catch {
      return 'Offline'
    }
  }

  return (
    <div className="w-80 border-r bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'oklch(0.205 0 0)' }}>
            <MessageCircle className="h-5 w-5" style={{ color: 'oklch(0.205 0 0)' }} />
            TaskFlow Chat
          </h2>
          <Badge variant="outline" className="text-xs border" style={{ 
            backgroundColor: 'oklch(0.95 0.02 150)', 
            color: 'oklch(0.205 0 0)',
            borderColor: 'oklch(0.205 0 0)'
          }}>
            {onlineUsersFiltered.length} online
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search people..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* GROUP DISCUSSION - Always at top */}
          <div className="mb-4">
            <div className="px-2 py-1 mb-2">
              <span className="text-sm font-medium" style={{ color: 'oklch(0.205 0 0)' }}>🌍 Group Chat</span>
            </div>
            
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                !privateChatId 
                  ? "text-white border shadow-lg transform scale-[1.02]" 
                  : "hover:border border-opacity-30"
              )}
              style={{
                backgroundColor: !privateChatId ? 'oklch(0.205 0 0)' : 'transparent',
                borderColor: 'oklch(0.205 0 0)',
                '--hover-bg': 'oklch(0.95 0.02 0)'
              }}
              onClick={onGroupChatSelect}
            >
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center shadow-md",
                !privateChatId 
                  ? "bg-white text-black" 
                  : "text-white"
              )}
              style={{
                backgroundColor: !privateChatId ? 'white' : 'oklch(0.205 0 0)'
              }}>
                <Users className="h-6 w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-semibold text-base",
                  !privateChatId ? "text-white" : ""
                )}
                style={{ color: !privateChatId ? 'white' : 'oklch(0.205 0 0)' }}>
                  Group Discussion
                </p>
                <p className={cn(
                  "text-sm",
                  !privateChatId ? "" : "text-gray-500"
                )}
                style={{ color: !privateChatId ? 'rgba(255,255,255,0.8)' : 'oklch(0.5 0 0)' }}>
                  {allUsers.length} members • TaskFlow team chat
                </p>
              </div>
              
              {!privateChatId && (
                <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-muted rounded animate-pulse mb-1" />
                    <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ONLINE USERS */}
              {onlineUsersFiltered.length > 0 && (
                <div className="mb-4">
                  <div className="px-2 py-1 mb-2">
                    <span className="text-sm font-medium text-green-600">
                      Active Now — {onlineUsersFiltered.length}
                    </span>
                  </div>
                  
                  {onlineUsersFiltered.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
                        privateChatId === user.id 
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 shadow-lg transform scale-[1.02]" 
                          : "hover:bg-green-50 border-green-200 hover:border-green-300"
                      )}
                      onClick={() => onPrivateChatSelect(user.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          {user.image ? (
                            <AvatarImage src={user.image} alt={user.name} />
                          ) : null}
                          <AvatarFallback className={cn(
                            privateChatId === user.id 
                              ? "bg-white text-green-600" 
                              : "bg-green-100 text-green-700"
                          )}>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Green online dot with pulse animation */}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                          <div className="h-full w-full bg-green-400 rounded-full animate-ping opacity-75" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-semibold text-base truncate",
                            privateChatId === user.id ? "text-white" : "text-gray-800"
                          )}>
                            {user.name}
                          </p>
                          <Badge variant="outline" className={cn(
                            "text-xs border",
                            privateChatId === user.id 
                              ? "bg-white text-green-600 border-white" 
                              : "bg-green-50 text-green-700 border-green-200"
                          )}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className={cn(
                          "text-sm font-medium",
                          privateChatId === user.id ? "text-green-100" : "text-green-600"
                        )}>
                          {getLastSeenText(user)}
                        </p>
                      </div>
                      
                      {privateChatId === user.id && (
                        <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* OFFLINE USERS */}
              {offlineUsersFiltered.length > 0 && (
                <div>
                  <div className="px-2 py-1 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Offline — {offlineUsersFiltered.length}
                    </span>
                  </div>
                  
                  {offlineUsersFiltered.map((user) => (
                    <div
                      key={user.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors opacity-75",
                        privateChatId === user.id ? "bg-gray-50 border border-gray-200" : "hover:bg-muted/50"
                      )}
                      onClick={() => onPrivateChatSelect(user.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          {user.image ? (
                            <AvatarImage src={user.image} alt={user.name} />
                          ) : null}
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {/* Gray offline dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-gray-400 rounded-full border-2 border-background" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getLastSeenText(user)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredUsers.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No users found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Chat Area Component
function ChatArea({ 
  chatType,
  otherUser,
  messages, 
  onSendMessage,
  onToggleSidebar,
  isLoading
}: {
  chatType: 'group' | 'private'
  otherUser?: AppUser
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  onToggleSidebar: () => void
  isLoading: boolean
}) {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    } catch {
      return ''
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getChatTitle = () => {
    if (chatType === 'group') return 'Group Discussion'
    return otherUser?.name || 'Private Chat'
  }

  const getChatSubtitle = () => {
    if (chatType === 'group') return 'TaskFlow team chat'
    if (!otherUser) return 'Private conversation'
    return otherUser.isOnline ? 'Active now' : 'Offline'
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-white to-gray-50 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              {chatType === 'group' ? (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
              ) : otherUser ? (
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                    {otherUser.image ? (
                      <AvatarImage src={otherUser.image} alt={otherUser.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                      {getInitials(otherUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  {otherUser.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm">
                      <div className="h-full w-full bg-green-400 rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                </div>
              ) : null}
              
              <div>
                <h3 className="font-bold text-lg text-gray-800">{getChatTitle()}</h3>
                <p className={cn(
                  "text-sm font-medium",
                  chatType === 'group' ? "text-blue-600" : 
                  otherUser?.isOnline ? "text-green-600" : "text-gray-500"
                )}>
                  {getChatSubtitle()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-50">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-500" />
            <span className="text-base text-gray-600">Loading messages...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === session?.user?.id
              const previousMessage = messages[index - 1]
              const showSender = !previousMessage || previousMessage.senderId !== message.senderId

              return (
                <div key={message.id}>
                  <div className={cn(
                    "flex gap-4",
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  )}>
                    {showSender && !isOwnMessage && (
                      <Avatar className="h-10 w-10 mt-1 border-2 border-white shadow-md">
                        {message.sender.image ? (
                          <AvatarImage src={message.sender.image} alt={message.sender.name} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                          {getInitials(message.sender.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={cn(
                      "flex flex-col max-w-[75%]",
                      isOwnMessage ? "items-end" : "items-start"
                    )}>
                      {showSender && (
                        <div className={cn(
                          "flex items-center gap-3 mb-2",
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        )}>
                          <span className="text-sm font-semibold text-gray-700">
                            {isOwnMessage ? 'You' : message.sender.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      )}

                      <div className={cn(
                        "px-4 py-3 rounded-2xl shadow-sm max-w-full break-words",
                        isOwnMessage
                          ? "text-white"
                          : "bg-white border border-gray-200"
                      )}
                      style={{
                        backgroundColor: isOwnMessage ? 'oklch(0.205 0 0)' : 'white'
                      }}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Show time for non-sender messages */}
                      {!showSender && (
                        <span className="text-xs text-gray-400 mt-1 px-2">
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
      <div className="p-4 border-t bg-white shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${getChatTitle()}...`}
              className="pr-20 rounded-full border-2 border-gray-200 focus:border-blue-400 py-3 text-base"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="rounded-full px-6 py-3 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'oklch(0.205 0 0)',
              borderColor: 'oklch(0.205 0 0)'
            }}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Main Facebook Style Chat Page - FIXED EXPORT
export default function ChatPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [chatType, setChatType] = useState<'group' | 'private'>('group')
  const [privateChatUserId, setPrivateChatUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [allUsers, setAllUsers] = useState<AppUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<AppUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Load users
  useEffect(() => {
    if (session?.user) {
      loadUsers()
    }
  }, [session])

  // Load messages when chat changes
  useEffect(() => {
    if (chatType === 'group') {
      loadGroupMessages()
    } else if (privateChatUserId) {
      loadPrivateMessages(privateChatUserId)
    }
  }, [chatType, privateChatUserId])

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await fetch('/api/team')
      if (response.ok) {
        const data = await response.json()
        const users = data.teamMembers || []
        
        const transformedUsers = users.map((user: any) => ({
          id: user.id,
          name: user.displayName || user.name,
          email: user.email,
          image: user.image,
          isOnline: user.status === 'ACTIVE' && user.lastActive && 
                   new Date().getTime() - new Date(user.lastActive).getTime() < 5 * 60 * 1000,
          lastSeen: user.lastActive,
          department: user.department,
          role: user.role
        }))
        
        setAllUsers(transformedUsers)
        setOnlineUsers(transformedUsers.filter((user: AppUser) => user.isOnline))
        
        console.log(`✅ Loaded ${transformedUsers.length} users`)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const loadGroupMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch('/api/chat/group/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        console.log(`✅ Loaded ${data.messages?.length || 0} group messages`)
      } else {
        // Fallback to mock data
        setMessages([
          {
            id: '1',
            content: 'Welcome to TaskFlow group chat! 👋',
            senderId: 'system',
            createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            sender: { id: 'system', name: 'System' }
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load group messages:', error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadPrivateMessages = async (userId: string) => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(`/api/chat/private/messages?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        console.log(`✅ Loaded ${data.messages?.length || 0} private messages`)
      } else {
        // Fallback to mock data
        const otherUser = allUsers.find(u => u.id === userId)
        setMessages([
          {
            id: 'p1',
            content: 'Hi! How are you doing?',
            senderId: userId,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            sender: { id: userId, name: otherUser?.name || 'User' }
          }
        ])
      }
    } catch (error) {
      console.error('Failed to load private messages:', error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleGroupChatSelect = () => {
    setChatType('group')
    setPrivateChatUserId(null)
    router.push('/dashboard/chat')
  }

  const handlePrivateChatSelect = (userId: string) => {
    setChatType('private')
    setPrivateChatUserId(userId)
    router.push(`/dashboard/chat?user=${userId}`)
    setIsSidebarOpen(false)
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Optimistic update - add message immediately
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      senderId: session?.user?.id || 'me',
      createdAt: new Date().toISOString(),
      sender: {
        id: session?.user?.id || 'me',
        name: session?.user?.name || 'You',
        image: session?.user?.image
      }
    }

    setMessages(prev => [...prev, tempMessage])

    try {
      if (chatType === 'group') {
        // Send to group chat API
        const response = await fetch('/api/chat/group/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() })
        })

        if (response.ok) {
          console.log('✅ Group message sent successfully')
          // Remove temp message and reload real messages
          setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
          // Wait a bit then reload to get the real message
          setTimeout(() => {
            loadGroupMessages()
          }, 500)
        } else {
          throw new Error('Failed to send group message')
        }
      } else if (privateChatUserId) {
        // Send to private chat API
        const response = await fetch('/api/chat/private/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: content.trim(),
            recipientId: privateChatUserId
          })
        })

        if (response.ok) {
          console.log('✅ Private message sent successfully')
          // Remove temp message and reload real messages
          setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
          // Wait a bit then reload to get the real message
          setTimeout(() => {
            loadPrivateMessages(privateChatUserId)
          }, 500)
        } else {
          throw new Error('Failed to send private message')
        }
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      // Remove failed temp message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      
      // Show error message
      alert('Failed to send message. Please try again.')
    }
  }

  const handleDeleteDatabase = () => {
    // Removed - no longer needed
  }

  const currentOtherUser = privateChatUserId ? allUsers.find(u => u.id === privateChatUserId) : undefined

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Facebook Style Sidebar */}
      <div className={cn(
        "transition-transform duration-200 md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <FacebookChatSidebar
          allUsers={allUsers}
          onlineUsers={onlineUsers}
          privateChatId={privateChatUserId}
          onGroupChatSelect={handleGroupChatSelect}
          onPrivateChatSelect={handlePrivateChatSelect}
          onDeleteDatabase={() => {}} // Empty function since we removed the button
          isLoading={isLoadingUsers}
        />
      </div>

      {/* Chat Area */}
      <ChatArea
        chatType={chatType}
        otherUser={currentOtherUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isLoading={isLoadingMessages}
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