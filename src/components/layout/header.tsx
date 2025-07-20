

// src/components/layout/header.tsx - Socket.IO Enhanced Version
'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useSidebar } from '@/contexts/sidebar-context'
import { useTheme } from '@/contexts/theme-context'
import { useSocket } from '@/hooks/use-socket'
import { toast } from 'sonner'
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Monitor,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  FolderOpen,
  X,
  Loader2,
  Trash2,
  SearchIcon,
  FileText,
  Calendar,
  MessageCircle,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react'

interface ProfileData {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  role?: string
}

export function Header() {
  const { toggle } = useSidebar()
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Socket.IO integration
  const {
    isConnected,
    onlineUsers,
    notifications,
    notificationCount,
    onlineCount,
    clearNotifications
  } = useSocket()

  // Local state
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    } else if (status !== 'loading') {
      setIsLoadingProfile(false)
    }
  }, [session, status])

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const response = await fetch('/api/profile')
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setProfile(data.user)
        }
      } else {
        setProfile(createFallbackProfile())
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setProfile(createFallbackProfile())
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const createFallbackProfile = (): ProfileData => {
    return {
      id: session?.user?.id || '',
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      image: session?.user?.image || '',
      role: 'EMPLOYEE'
    }
  }

  const getDisplayName = (): string => {
    if (isLoadingProfile) return 'Loading...'
    
    if (!profile) {
      return session?.user?.name || 'User'
    }

    if (profile.firstName || profile.lastName) {
      const firstName = profile.firstName || ''
      const lastName = profile.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim()
      return fullName || 'User'
    }
    
    return profile.name || session?.user?.name || 'User'
  }

  const getDisplayEmail = (): string => {
    return profile?.email || session?.user?.email || 'user@example.com'
  }

  const getDisplayImage = (): string => {
    return profile?.image || session?.user?.image || ''
  }

  const getInitials = (): string => {
    const name = getDisplayName()
    if (!name || name === 'User' || name === 'Loading...') return '??'
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <Plus className="h-4 w-4 text-blue-500" />
      case 'task_status_changed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'task_assigned':
        return <User className="h-4 w-4 text-purple-500" />
      case 'project_created':
        return <FolderOpen className="h-4 w-4 text-orange-500" />
      case 'private_message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(timestamp).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const handleLogout = async () => {
    toast.success("Signed out successfully! 👋", {
      description: "You have been logged out. See you next time!",
      duration: 3000,
    })
    
    setTimeout(() => {
      signOut({ callbackUrl: '/login' })
    }, 1000)
  }

  // Show loading state
  if (status === 'loading') {
    return (
      <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-full items-center justify-center px-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </header>
    )
  }

  // Show sign in prompt if not authenticated
  if (!session) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TF</span>
            </div>
            <span className="font-bold text-lg">TaskFlow</span>
          </div>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>
    )
  }

  const displayName = getDisplayName()
  const displayEmail = getDisplayEmail()
  const displayImage = getDisplayImage()
  const userInitials = getInitials()

  return (
    <>
      {/* ENHANCED HEADER WITH SOCKET.IO */}
      <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left side - Mobile menu + Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggle}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer">
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </div>
              <span className="hidden sm:inline-block font-bold text-lg cursor-pointer">TaskFlow</span>
            </Link>
          </div>

          {/* Center - Search Button */}
          <div className="flex-1 max-w-sm mx-4">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground bg-muted/50"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Search tasks, projects...</span>
              <span className="sm:hidden">Search...</span>
            </Button>
          </div>

          {/* Right side - Enhanced with Socket.IO indicators */}
          <div className="flex items-center space-x-3">
            <Button size="sm" className="hidden sm:flex" asChild>
              <Link href="/dashboard/tasks">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Link>
            </Button>

            <div className="flex items-center space-x-1">
              {/* Real-time Connection Status */}
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Live ({onlineCount})
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Offline
                    </span>
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[10001]">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Enhanced Chat Icon with Socket.IO */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="h-5 w-5" />
                    {isConnected && (
                      <div className="absolute -top-1 -left-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                    {onlineCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-500">
                        {onlineCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mr-4 z-[10000]" align="end">
                  <div className="border-b p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Team Chat</h3>
                      <Badge variant="outline" className="text-xs">
                        {onlineCount} online
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {onlineUsers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No one online</p>
                        <p className="text-sm">Be the first to start chatting!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Online Team Members
                        </p>
                        <div className="space-y-2">
                          {onlineUsers.slice(0, 5).map((user) => (
                            <div
                              key={user.userId}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => {
                                window.location.href = `/dashboard/chat/direct/${user.userId}`
                              }}
                            >
                              <div className="relative">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-xs font-semibold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{user.name}</p>
                                <p className="text-xs text-green-600">Online now</p>
                              </div>
                            </div>
                          ))}
                          
                          {onlineUsers.length > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              +{onlineUsers.length - 5} more online
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
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

              {/* Real-time Notifications with Socket.IO */}
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 p-0 mr-4 z-[10000]" 
                  align="end"
                  side="bottom"
                  sideOffset={8}
                >
                  <div className="border-b p-4 flex items-center justify-between">
                    <h3 className="font-semibold">Real-time Notifications</h3>
                    <div className="flex items-center gap-2">
                      {notificationCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            clearNotifications()
                            setNotificationsOpen(false)
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear all
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setNotificationsOpen(false)}
                        className="h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No notifications</p>
                        <p className="text-sm">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (notification.taskId) {
                                router.push('/dashboard/tasks')
                              } else if (notification.projectId) {
                                router.push('/dashboard/projects')
                              }
                              setNotificationsOpen(false)
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatNotificationTime(notification.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  {notifications.length > 0 && (
                    <div className="border-t p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        asChild
                      >
                        <Link href="/dashboard">
                          View Dashboard
                        </Link>
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      {displayImage ? (
                        <AvatarImage 
                          src={displayImage} 
                          alt={displayName} 
                          className="cursor-pointer"
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground cursor-pointer">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 z-[10001]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {displayEmail}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {isConnected ? (
                          <>
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span className="text-xs text-green-600">Online</span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 bg-gray-400 rounded-full" />
                            <span className="text-xs text-gray-500">Offline</span>
                          </>
                        )}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header