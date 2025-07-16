// src/components/chat/chat-header-icon.tsx - DYNAMIC VERSION
'use client'

import { useState, useEffect } from 'react'
import { useChatStore } from '@/stores/chat-store'
import { useSession } from 'next-auth/react'

export function ChatHeaderIcon() {
  const { data: session } = useSession()
  const { 
    rooms, 
    isConnected, 
    onlineUsers, 
    loadRooms,
    isLoadingRooms 
  } = useChatStore()
  
  // Load real data on mount
  useEffect(() => {
    if (session?.user) {
      loadRooms() // Fetch from database
    }
  }, [session, loadRooms])
  
  // Calculate real unread count from database
  const totalUnread = rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Real connection status and unread count */}
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className={`h-5 w-5 ${totalUnread > 0 ? 'text-blue-600' : ''}`} />
          
          {/* Real connection status */}
          <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-background ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          
          {/* Real unread count */}
          {totalUnread > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold">
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 mr-4" align="end">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-semibold">Team Chat</h3>
            <Badge variant="outline" className="text-xs">
              {onlineUsers.length} online
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          {isLoadingRooms ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No chat rooms</p>
              <p className="text-sm">Contact admin to join rooms</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Your Rooms ({rooms.length})
              </p>
              {/* Real rooms from database */}
              {rooms.slice(0, 5).map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => {
                    window.location.href = `/dashboard/chat?room=${room.id}`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {room.type === 'GENERAL' && <Hash className="h-4 w-4" />}
                      {room.type === 'PROJECT' && <Users className="h-4 w-4" />}
                      {room.type === 'ANNOUNCEMENT' && <Bell className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.memberCount} members • {room.messageCount} messages
                      </p>
                    </div>
                  </div>
                  {room.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t p-3">
          <Button className="w-full" size="sm" onClick={() => {
            window.location.href = '/dashboard/chat'
          }}>
            Open Full Chat
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}