// File 7: src/components/presence/online-users-sidebar.tsx
// Sidebar component showing online users
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { usePresence } from '@/lib/presence-manager'
import { 
  Circle, 
  Crown, 
  Shield, 
  User, 
  Building2, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function OnlineUsersSidebar() {
  const { onlineUsers, awayUsers, isLoading } = usePresence()
  const [showAway, setShowAway] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-3 w-3 text-red-500" />
      case 'MANAGER': return <Shield className="h-3 w-3 text-blue-500" />
      default: return <User className="h-3 w-3 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Online Users</div>
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const displayOnlineUsers = showAll ? onlineUsers : onlineUsers.slice(0, 5)

  return (
    <div className="space-y-3">
      {/* Online Users Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-600">
              Online ({onlineUsers.length})
            </span>
          </div>
          {onlineUsers.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs hover:underline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Show All
                </>
              )}
            </Button>
          )}
        </div>

        {onlineUsers.length > 0 ? (
          <div className="space-y-2">
            {displayOnlineUsers.map((user) => (
              <div key={user.userId} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-50 transition-colors">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium truncate">{user.name}</p>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {user.department && (
                      <span className="flex items-center gap-1 truncate">
                        <Building2 className="h-2.5 w-2.5" />
                        {user.department}
                      </span>
                    )}
                  </div>
                </div>
                {user.isActive && (
                  <Badge variant="outline" className="text-xs px-1 py-0 bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground py-2">
            No users online
          </div>
        )}
      </div>

      {/* Away Users Section */}
      {awayUsers.length > 0 && (
        <>
          <Separator />
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-auto p-2 hover:bg-yellow-50"
              onClick={() => setShowAway(!showAway)}
            >
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">
                  Away ({awayUsers.length})
                </span>
              </div>
              {showAway ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>

            {showAway && (
              <div className="space-y-2 mt-2">
                {awayUsers.slice(0, 3).map((user) => (
                  <div key={user.userId} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-yellow-50 transition-colors">
                    <div className="relative">
                      <Avatar className="h-6 w-6 opacity-75">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        <Circle className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate opacity-75">{user.name}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
                {awayUsers.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{awayUsers.length - 3} more away
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}