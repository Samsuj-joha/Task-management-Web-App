// src/components/chat/enhanced-chat-header-icon.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  MessageCircle,
  Hash,
  Users,
  Bell,
  User,
  Loader2,
  Circle
} from 'lucide-react'

interface ChatRoom {
  id: string
  name: string
  type: 'GENERAL' | 'PROJECT' | 'DIRECT' | 'ANNOUNCEMENT'
  memberCount: number
  messageCount: number
  unreadCount: number
  lastMessageAt?: string
  isPrivate: boolean
}

interface DirectMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    name: string
    image?: string
    isOnline: boolean
  }
}

interface OnlineUser {
  id: string
  name: string
  image?: string
  isOnline: boolean
  status: 'ACTIVE' | 'AWAY' | 'INACTIVE'
  lastSeen?: string
}

export function EnhancedChatHeaderIcon() {
  const { data: session } = useSession()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load chat data with real-time updates
  const loadChatData = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      
      // Load chat rooms
      const roomsResponse = await fetch('/api/chat/rooms')
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json()
        setRooms(roomsData.rooms || [])
      }

      // Load direct messages (unread private messages)
      const dmResponse = await fetch('/api/chat/direct-messages')
      if (dmResponse.ok) {
        const dmData = await dmResponse.json()
        setDirectMessages(dmData.messages || [])
      }

      // Load online users
      const usersResponse = await fetch('/api/team/online')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setOnlineUsers(usersData.users || [])
      }

      setIsConnected(true)
      
    } catch (error) {
      console.error('Failed to load chat data:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Initial load and periodic refresh
  useEffect(() => {
    if (session?.user) {
      loadChatData()
      
      // Refresh every 30 seconds for real-time updates
      const interval = setInterval(loadChatData, 30000)
      return () => clearInterval(interval)
    }
  }, [session, loadChatData])

  // Listen for chat updates from other parts of the app
  useEffect(() => {
    const handleChatUpdate = () => {
      loadChatData()
    }

    // Listen for custom events
    window.addEventListener('chatUpdate', handleChatUpdate)
    window.addEventListener('newMessage', handleChatUpdate)
    window.addEventListener('privateMessage', handleChatUpdate)

    return () => {
      window.removeEventListener('chatUpdate', handleChatUpdate)
      window.removeEventListener('newMessage', handleChatUpdate)
      window.removeEventListener('privateMessage', handleChatUpdate)
    }
  }, [loadChatData])

  // Calculate total unread count (rooms + direct messages)
  const totalRoomUnread = rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
  const totalDMUnread = directMessages.filter(dm => !dm.isRead && dm.receiverId === session?.user?.id).length
  const totalUnread = totalRoomUnread + totalDMUnread
  const hasUnread = totalUnread > 0

  // Get room icon based on type
  const getRoomIcon = (type: string, isPrivate: boolean) => {
    if (isPrivate) return <User className="h-4 w-4 text-blue-600" />
    
    switch (type) {
      case 'GENERAL':
        return <Hash className="h-4 w-4 text-blue-600" />
      case 'PROJECT':
        return <Users className="h-4 w-4 text-blue-600" />
      case 'ANNOUNCEMENT':
        return <Bell className="h-4 w-4 text-blue-600" />
      case 'DIRECT':
        return <MessageCircle className="h-4 w-4 text-blue-600" />
      default:
        return <MessageCircle className="h-4 w-4 text-blue-600" />
    }
  }

  // Format last seen time
  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Never'
    
    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle 
              className={`h-5 w-5 ${hasUnread ? 'text-blue-600' : ''}`} 
            />
            
            {/* Connection status indicator */}
            <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-background ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            
            {/* Enhanced unread count badge */}
            {hasUnread && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500"
              >
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </Button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 mr-4 z-[10000]" align="end">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-600">Team Chat</h3>
            <Badge variant="outline" className="text-xs border-blue-600 text-blue-600">
              {onlineUsers.length} online
            </Badge>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <ScrollArea className="max-h-96">
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="font-medium">Loading chat rooms...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Direct Messages Section */}
                {totalDMUnread > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Private Messages ({totalDMUnread} unread)
                    </p>
                    <div className="space-y-2">
                      {directMessages
                        .filter(dm => !dm.isRead && dm.receiverId === session?.user?.id)
                        .slice(0, 3)
                        .map((dm) => (
                          <div
                            key={dm.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border-l-2 border-l-blue-500"
                            onClick={() => {
                              window.location.href = `/dashboard/chat/direct/${dm.senderId}`
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 relative">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-xs font-semibold text-white">
                                    {dm.sender.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                {dm.sender.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{dm.sender.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {dm.content.length > 30 ? `${dm.content.substring(0, 30)}...` : dm.content}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Chat Rooms Section */}
                {rooms.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No chat rooms</p>
                    <p className="text-sm">Start chatting with your team</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Rooms ({rooms.length})
                      {totalRoomUnread > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {totalRoomUnread} unread
                        </Badge>
                      )}
                    </p>
                    <div className="space-y-2">
                      {rooms.slice(0, 6).map((room) => (
                        <div
                          key={room.id}
                          className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                            room.unreadCount > 0 ? 'border-l-2 border-l-blue-500' : ''
                          }`}
                          onClick={() => {
                            window.location.href = `/dashboard/chat?room=${room.id}`
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {getRoomIcon(room.type, room.isPrivate)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`font-medium text-sm truncate ${
                                room.unreadCount > 0 ? 'font-bold' : ''
                              }`}>
                                {room.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {room.memberCount} members
                                {room.messageCount > 0 && ` • ${room.messageCount} messages`}
                                {room.lastMessageAt && ` • ${formatLastSeen(room.lastMessageAt)}`}
                              </p>
                            </div>
                          </div>
                          {room.unreadCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="text-xs bg-red-500"
                            >
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))}
                      
                      {rooms.length > 6 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{rooms.length - 6} more rooms
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Online Users Section */}
                {onlineUsers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Circle className="h-4 w-4 fill-green-500 text-green-500" />
                      Online Now ({onlineUsers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {onlineUsers.slice(0, 8).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => {
                            window.location.href = `/dashboard/chat/direct/${user.id}`
                          }}
                        >
                          <div className="relative">
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs font-semibold text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-background" />
                          </div>
                          <span className="text-xs font-medium truncate max-w-16">
                            {user.name.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                      
                      {onlineUsers.length > 8 && (
                        <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
                          +{onlineUsers.length - 8} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="border-t p-3">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            size="sm"
            onClick={() => {
              window.location.href = '/dashboard/chat'
            }}
          >
            Open Full Chat
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}