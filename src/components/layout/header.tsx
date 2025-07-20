


// src/components/layout/header.tsx - COMPLETE FULL VERSION
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  CheckCircle2,
  FolderOpen,
  X,
  Loader2,
  Trash2,
  FileText,
  MessageCircle,
  Wifi,
  WifiOff,
  Send,
  ArrowRight
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

interface SearchResult {
  id: string
  title: string
  type: 'task' | 'project' | 'user' | 'note'
  description?: string
  status?: string
  url: string
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: Date
  type: 'text' | 'system'
}

export function Header() {
  const { toggle } = useSidebar()
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Socket.IO integration with fallback
  const socketData = useSocket()
  const {
    isConnected = false,
    onlineUsers = [],
    notifications = [],
    notificationCount = 0,
    onlineCount = 0,
    clearNotifications = () => {}
  } = socketData || {}

  // Local state
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Fetch profile data
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    } else if (status !== 'loading') {
      setIsLoadingProfile(false)
    }
  }, [session, status])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      performSearch(searchQuery)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Load initial chat messages
  useEffect(() => {
    if (chatOpen) {
      loadChatMessages()
    }
  }, [chatOpen])

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

  const performSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      // Mock search results for demo
      setSearchResults([
        {
          id: '1',
          title: `Task containing "${query}"`,
          type: 'task',
          description: 'Sample task result - click to navigate',
          status: 'TODO',
          url: '/dashboard/tasks'
        },
        {
          id: '2',
          title: `Project: ${query}`,
          type: 'project',
          description: 'Sample project result - click to navigate',
          url: '/dashboard/projects'
        },
        {
          id: '3',
          title: `User: ${query}`,
          type: 'user',
          description: 'Sample user result - click to navigate',
          url: '/dashboard/team'
        }
      ])
    } finally {
      setIsSearching(false)
    }
  }

  const loadChatMessages = async () => {
    try {
      const response = await fetch('/api/chat/general')
      if (response.ok) {
        const data = await response.json()
        setChatMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Load chat error:', error)
      // Mock messages for demo
      setChatMessages([
        {
          id: '1',
          content: 'Welcome to the team chat! 👋',
          senderId: 'system',
          senderName: 'System',
          timestamp: new Date(Date.now() - 60000),
          type: 'system'
        },
        {
          id: '2',
          content: 'Hello everyone! Great work on the new features.',
          senderId: 'demo-user',
          senderName: 'Demo User',
          timestamp: new Date(Date.now() - 30000),
          type: 'text'
        }
      ])
    }
  }

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: session?.user?.id || '',
      senderName: getDisplayName(),
      timestamp: new Date(),
      type: 'text'
    }

    // Optimistically add message
    setChatMessages(prev => [...prev, message])
    const messageToSend = newMessage.trim()
    setNewMessage('')

    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageToSend,
          roomId: 'general'
        })
      })
      toast.success('Message sent! 💬')
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
      // Remove the optimistic message on error
      setChatMessages(prev => prev.filter(m => m.id !== message.id))
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
      role: 'USER'
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

  const getSearchIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />
      case 'project':
        return <FolderOpen className="h-4 w-4 text-orange-500" />
      case 'user':
        return <User className="h-4 w-4 text-purple-500" />
      case 'note':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
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

  const formatChatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
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
      {/* MAIN HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-full items-center justify-between px-4">
          
          {/* LEFT SIDE - Mobile menu + Logo */}
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

          {/* CENTER - Search Button */}
          <div className="flex-1 max-w-sm mx-4">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground bg-muted/50 hover:bg-muted"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Search tasks, projects...</span>
              <span className="sm:hidden">Search...</span>
            </Button>
          </div>

          {/* RIGHT SIDE - Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Add Task Button */}
            <Button size="sm" className="hidden sm:flex" asChild>
              <Link href="/dashboard/tasks">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Link>
            </Button>

            <div className="flex items-center space-x-1">
              
              {/* Connection Status */}
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

              {/* Chat Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setChatOpen(true)}
              >
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

              {/* Notifications */}
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
                    <h3 className="font-semibold">Notifications</h3>
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
                        <p className="text-sm">You're all caught up! 🎉</p>
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

      {/* SEARCH DIALOG */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[600px] z-[10002]">
          <DialogHeader>
            <DialogTitle>Search Everything</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, projects, users, notes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
              )}
            </div>
            
            <ScrollArea className="h-[300px]">
              {searchResults.length === 0 && searchQuery.length > 2 && !isSearching ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No results found</p>
                  <p className="text-sm">Try different keywords</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Start typing to search</p>
                  <p className="text-sm">Find tasks, projects, and more</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => {
                        router.push(result.url)
                        setSearchOpen(false)
                        setSearchQuery('')
                        toast.success(`Navigating to ${result.title}`)
                      }}
                    >
                      <div className="flex-shrink-0">
                        {getSearchIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{result.title}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

{/* CHAT DIALOG - Updated with proper button styling */}
<Dialog open={chatOpen} onOpenChange={setChatOpen}>
  <DialogContent className="sm:max-w-[500px] h-[600px] z-[10002] flex flex-col">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Team Chat
        <Badge variant="outline" className="text-xs">
          {onlineCount} online
        </Badge>
      </DialogTitle>
    </DialogHeader>
    
    <div className="flex-1 flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              {message.type === 'system' ? (
                <div className="w-full text-center">
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1 inline-block">
                    {message.content}
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-white">
                      {message.senderName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{message.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatChatTime(message.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-foreground">{message.content}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* Empty state when no messages */}
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground">Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendChatMessage()
              }
            }}
            className="flex-1"
            maxLength={500}
          />
          <Button 
            size="icon" 
            onClick={sendChatMessage}
            disabled={!newMessage.trim()}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Character count */}
        {newMessage.length > 400 && (
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {newMessage.length}/500
          </p>
        )}
        
        {/* Real Active Users */}
        {onlineUsers.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Active Users ({onlineCount})
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {onlineUsers.slice(0, 8).map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-1 text-xs bg-muted/50 rounded-full px-2 py-1"
                  title={`${user.name} - ${user.email}`}
                >
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="truncate max-w-[80px]">{user.name}</span>
                </div>
              ))}
              {onlineUsers.length > 8 && (
                <span className="text-xs text-muted-foreground">
                  +{onlineUsers.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Quick actions - UPDATED BUTTON STYLING */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button
              className="text-xs h-7 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
              onClick={() => {
                setChatOpen(false)
                router.push('/dashboard/chat')
                toast.success('Opening full chat...')
              }}
            >
              Open Full Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => setChatOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>
    </>
  )
}

export default Header