// File 2: src/components/presence/active-users-widget.tsx
// Dashboard widget showing active users
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { usePresence } from '@/lib/presence-manager'
import { 
  Users, 
  Circle, 
  Clock, 
  Eye,
  Crown,
  Shield,
  User,
  Building2,
  MapPin,
  Activity
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function ActiveUsersWidget() {
  const { users, onlineCount, onlineUsers, awayUsers, offlineUsers, isLoading } = usePresence()
  const [showDetails, setShowDetails] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <Circle className="h-3 w-3 fill-green-500 text-green-500" />
      case 'AWAY':
        return <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
      case 'OFFLINE':
        return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
      default:
        return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="h-3 w-3 text-red-500" />
      case 'MANAGER': return <Shield className="h-3 w-3 text-blue-500" />
      default: return <User className="h-3 w-3 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
          <p className="text-xs text-muted-foreground">Checking who's online</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowDetails(true)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <div className="flex items-center space-x-1">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
            <Circle className="h-3 w-3 fill-green-500 text-green-500 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">
            {onlineCount === 1 ? 'user online now' : 'users online now'}
          </p>
          
          {/* Quick preview of online users */}
          {onlineUsers.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center space-x-1 mb-2">
                {onlineUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.userId} className="h-6 w-6">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {onlineUsers.slice(0, 2).map(u => u.name.split(' ')[0]).join(', ')}
                {onlineUsers.length > 2 && ` and ${onlineUsers.length - 2} more`}
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{awayUsers.length} away</span>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs hover:underline">
              <Eye className="mr-1 h-3 w-3" />
              View All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users ({users.length})
            </DialogTitle>
            <DialogDescription>
              Real-time user presence and activity status
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{onlineUsers.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                Online
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{awayUsers.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Away
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{offlineUsers.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
                Offline
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-96 pr-4">
            {/* Online Users */}
            {onlineUsers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                  Online ({onlineUsers.length})
                </h4>
                <div className="space-y-3">
                  {onlineUsers.map((user) => (
                    <div key={user.userId} className="flex items-center space-x-3 p-2 rounded-lg bg-green-50 border-l-4 border-green-500">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {user.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {user.department}
                            </span>
                          )}
                          {user.currentPage && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.currentPage.replace('/dashboard/', '')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        {user.isActive ? 'Active now' : 'Online'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Away Users */}
            {awayUsers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                  <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  Away ({awayUsers.length})
                </h4>
                <div className="space-y-3">
                  {awayUsers.map((user) => (
                    <div key={user.userId} className="flex items-center space-x-3 p-2 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {user.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {user.department}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">
                        Away
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Users - Show only first 5 */}
            {offlineUsers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
                  Recently Offline ({offlineUsers.length})
                </h4>
                <div className="space-y-2">
                  {offlineUsers.slice(0, 5).map((user) => (
                    <div key={user.userId} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                      <Avatar className="h-6 w-6 opacity-60">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate opacity-75">{user.name}</p>
                        <div className="text-xs text-muted-foreground">
                          Last seen {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {offlineUsers.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{offlineUsers.length - 5} more offline users
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
