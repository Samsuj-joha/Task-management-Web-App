// // src/components/layout/header.tsx - FIXED WITH DYNAMIC CHAT + Z-INDEX
// 'use client'

// import Link from 'next/link'
// import { useState, useEffect, useMemo, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
// import { signOut, useSession } from 'next-auth/react'
// import { Button } from '@/components/ui/button'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { useSidebar } from '@/contexts/sidebar-context'
// import { useTheme } from '@/contexts/theme-context'
// import { toast } from 'sonner'
// import { 
//   Menu, 
//   Search, 
//   Bell, 
//   Settings, 
//   User, 
//   LogOut, 
//   Sun, 
//   Moon, 
//   Monitor,
//   Plus,
//   Clock,
//   AlertCircle,
//   CheckCircle2,
//   Target,
//   FolderOpen,
//   X,
//   Loader2,
//   Trash2,
//   SearchIcon,
//   FileText,
//   Calendar,
//   Users,
//   MessageCircle,
//   Hash
// } from 'lucide-react'

// // Define interfaces
// interface ProfileData {
//   id?: string
//   name?: string
//   firstName?: string
//   lastName?: string
//   email?: string
//   image?: string
//   role?: string
//   department?: string
//   phone?: string
//   location?: string
//   bio?: string
//   skills?: string[]
// }

// interface Task {
//   id: string
//   name?: string
//   title?: string
//   status: string
//   priority: string
//   dueDate?: string
//   completedAt?: string
//   createdAt: string
//   module?: { name: string }
//   taskType?: { name: string }
//   devDept?: { name: string }
// }

// interface Project {
//   id: string
//   name: string
//   status: string
//   endDate?: string
//   createdAt: string
// }

// interface Notification {
//   id: string
//   type: 'task_overdue' | 'task_due_soon' | 'project_deadline' | 'task_completed' | 'project_created' | 'task_created' | 'task_status_changed'
//   title: string
//   message: string
//   timestamp: Date
//   isRead: boolean
//   priority: 'low' | 'medium' | 'high' | 'urgent'
//   actionUrl?: string
//   taskId?: string
//   projectId?: string
// }

// interface SearchResult {
//   id: string
//   type: 'task' | 'project' | 'user'
//   title: string
//   subtitle?: string
//   url: string
//   icon: React.ReactNode
// }

// // DYNAMIC Chat Hook - Real API calls
// function useDynamicChatData() {
//   const [rooms, setRooms] = useState<any[]>([])
//   const [onlineUsers, setOnlineUsers] = useState<any[]>([])
//   const [isConnected, setIsConnected] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
//   const { data: session } = useSession()

//   useEffect(() => {
//     if (session?.user) {
//       loadChatData()
      
//       // Refresh every 30 seconds for real-time updates
//       const interval = setInterval(loadChatData, 30000)
//       return () => clearInterval(interval)
//     }
//   }, [session])

//   const loadChatData = async () => {
//     try {
//       setIsLoading(true)
      
//       // Load real chat rooms from API
//       const roomsResponse = await fetch('/api/chat/rooms')
//       if (roomsResponse.ok) {
//         const roomsData = await roomsResponse.json()
//         setRooms(roomsData.rooms || [])
//         setIsConnected(true)
//       }
      
//       // Load online users from team API
//       const usersResponse = await fetch('/api/team')
//       if (usersResponse.ok) {
//         const usersData = await usersResponse.json()
//         const users = usersData.teamMembers || []
//         const onlineUsers = users.filter((user: any) => 
//           user.status === 'ACTIVE' && user.lastActive && 
//           new Date().getTime() - new Date(user.lastActive).getTime() < 5 * 60 * 1000
//         )
//         setOnlineUsers(onlineUsers)
//       }
      
//       console.log('✅ Dynamic chat data loaded')
//     } catch (error) {
//       console.error('Failed to load chat data:', error)
//       setIsConnected(false)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return { rooms, onlineUsers, isConnected, isLoading }
// }

// // Dynamic Chat Header Icon Component
// function DynamicChatHeaderIcon() {
//   const { rooms, isConnected, onlineUsers, isLoading } = useDynamicChatData()
  
//   // Calculate REAL unread count from database
//   const totalUnread = rooms.reduce((total, room) => total + (room.unreadCount || 0), 0)
//   const hasUnread = totalUnread > 0

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <div className="relative">
//           <Button variant="ghost" size="icon" className="relative">
//             <MessageCircle 
//               className="h-5 w-5" 
//               style={{ color: hasUnread ? 'oklch(0.205 0 0)' : '' }} 
//             />
            
//             {/* Real connection status */}
//             <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border-2 border-background ${
//               isConnected ? 'bg-green-500' : 'bg-gray-400'
//             }`} />
            
//             {/* DYNAMIC unread count */}
//             {hasUnread && (
//               <Badge 
//                 variant="destructive" 
//                 className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
//                 style={{ backgroundColor: 'oklch(0.205 0 0)' }}
//               >
//                 {totalUnread > 99 ? '99+' : totalUnread}
//               </Badge>
//             )}
//           </Button>
//         </div>
//       </PopoverTrigger>
      
//       <PopoverContent className="w-80 p-0 mr-4 z-[10000]" align="end">
//         <div className="border-b p-4 flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <MessageCircle className="h-5 w-5" style={{ color: 'oklch(0.205 0 0)' }} />
//             <h3 className="font-semibold" style={{ color: 'oklch(0.205 0 0)' }}>Team Chat</h3>
//             <Badge variant="outline" className="text-xs" style={{ 
//               borderColor: 'oklch(0.205 0 0)', 
//               color: 'oklch(0.205 0 0)' 
//             }}>
//               {onlineUsers.length} online
//             </Badge>
//           </div>
//         </div>
        
//         <div className="p-4">
//           {isLoading ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" style={{ color: 'oklch(0.205 0 0)' }} />
//               <p className="font-medium">Loading chat rooms...</p>
//             </div>
//           ) : rooms.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
//               <p className="font-medium">No chat rooms</p>
//               <p className="text-sm">Start chatting with your team</p>
//             </div>
//           ) : (
//             <div className="space-y-2">
//               <p className="text-sm font-medium text-muted-foreground mb-3">
//                 Your Rooms ({rooms.length})
//               </p>
//               {/* REAL rooms from database */}
//               {rooms.slice(0, 5).map((room) => (
//                 <div
//                   key={room.id}
//                   className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
//                   onClick={() => {
//                     window.location.href = `/dashboard/chat?room=${room.id}`
//                   }}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="flex-shrink-0">
//                       {room.type === 'GENERAL' && <Hash className="h-4 w-4" style={{ color: 'oklch(0.205 0 0)' }} />}
//                       {room.type === 'PROJECT' && <Users className="h-4 w-4" style={{ color: 'oklch(0.205 0 0)' }} />}
//                       {room.type === 'DIRECT' && <MessageCircle className="h-4 w-4" style={{ color: 'oklch(0.205 0 0)' }} />}
//                       {room.type === 'ANNOUNCEMENT' && <Bell className="h-4 w-4" style={{ color: 'oklch(0.205 0 0)' }} />}
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-sm truncate">{room.name}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {room.memberCount} members
//                         {room.messageCount > 0 && ` • ${room.messageCount} messages`}
//                       </p>
//                     </div>
//                   </div>
//                   {room.unreadCount > 0 && (
//                     <Badge 
//                       variant="destructive" 
//                       className="text-xs"
//                       style={{ backgroundColor: 'oklch(0.205 0 0)' }}
//                     >
//                       {room.unreadCount > 99 ? '99+' : room.unreadCount}
//                     </Badge>
//                   )}
//                 </div>
//               ))}
              
//               {rooms.length > 5 && (
//                 <p className="text-xs text-muted-foreground text-center pt-2">
//                   +{rooms.length - 5} more rooms
//                 </p>
//               )}
//             </div>
//           )}
//         </div>
        
//         <div className="border-t p-3">
//           <Button 
//             className="w-full" 
//             size="sm"
//             style={{ backgroundColor: 'oklch(0.205 0 0)' }}
//             onClick={() => {
//               window.location.href = '/dashboard/chat'
//             }}
//           >
//             Open Full Chat
//           </Button>
//         </div>
//       </PopoverContent>
//     </Popover>
//   )
// }

// export function Header() {
//   const { toggle } = useSidebar()
//   const { theme, setTheme } = useTheme()
//   const { data: session, status } = useSession()
//   const router = useRouter()
  
//   // Local state for profile and data
//   const [profile, setProfile] = useState<ProfileData | null>(null)
//   const [tasks, setTasks] = useState<Task[]>([])
//   const [projects, setProjects] = useState<Project[]>([])
//   const [isLoadingProfile, setIsLoadingProfile] = useState(true)
//   const [isLoadingTasks, setIsLoadingTasks] = useState(true)
//   const [notificationsOpen, setNotificationsOpen] = useState(false)
//   const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
  
//   // Search state
//   const [searchOpen, setSearchOpen] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [searchResults, setSearchResults] = useState<SearchResult[]>([])
//   const [isSearching, setIsSearching] = useState(false)

//   // Real-time update intervals
//   const [lastUpdate, setLastUpdate] = useState(Date.now())

//   // Fetch profile data
//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchProfile()
//     } else if (status !== 'loading') {
//       setIsLoadingProfile(false)
//     }
//   }, [session, status])

//   // Real-time data fetching with polling
//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchTasksAndProjects()
      
//       // Set up polling every 30 seconds for real-time updates
//       const interval = setInterval(() => {
//         fetchTasksAndProjects()
//         setLastUpdate(Date.now())
//       }, 30000)

//       return () => clearInterval(interval)
//     }
//   }, [session])

//   // Listen for real-time events (task creation, status changes, etc.)
//   useEffect(() => {
//     const handleTaskUpdate = (event: CustomEvent) => {
//       console.log('🔄 Task update detected:', event.detail)
//       fetchTasksAndProjects()
//       setLastUpdate(Date.now())
      
//       // Create real-time notification
//       if (event.detail.type === 'task_created') {
//         addRealTimeNotification({
//           id: `task-created-${event.detail.taskId}-${Date.now()}`,
//           type: 'task_created',
//           title: 'New Task Created',
//           message: `Task "${event.detail.taskName}" has been created`,
//           timestamp: new Date(),
//           isRead: false,
//           priority: 'medium',
//           actionUrl: '/dashboard/tasks',
//           taskId: event.detail.taskId
//         })
//       } else if (event.detail.type === 'task_status_changed') {
//         addRealTimeNotification({
//           id: `status-changed-${event.detail.taskId}-${Date.now()}`,
//           type: 'task_status_changed',
//           title: 'Task Status Updated',
//           message: `Task "${event.detail.taskName}" status changed to ${event.detail.newStatus.replace('_', ' ')}`,
//           timestamp: new Date(),
//           isRead: false,
//           priority: event.detail.newStatus === 'COMPLETED' ? 'low' : 'medium',
//           actionUrl: '/dashboard/tasks',
//           taskId: event.detail.taskId
//         })
//       }
//     }

//     const handleProjectUpdate = (event: CustomEvent) => {
//       console.log('🔄 Project update detected:', event.detail)
//       fetchTasksAndProjects()
//       setLastUpdate(Date.now())
//     }

//     // Listen for custom events
//     window.addEventListener('taskUpdated', handleTaskUpdate as EventListener)
//     window.addEventListener('projectUpdated', handleProjectUpdate as EventListener)
//     window.addEventListener('profileUpdated', fetchProfile)

//     return () => {
//       window.removeEventListener('taskUpdated', handleTaskUpdate as EventListener)
//       window.removeEventListener('projectUpdated', handleProjectUpdate as EventListener)
//       window.removeEventListener('profileUpdated', fetchProfile)
//     }
//   }, [])

//   // Search functionality
//   useEffect(() => {
//     if (searchQuery.trim().length > 1) {
//       performSearch(searchQuery)
//     } else {
//       setSearchResults([])
//     }
//   }, [searchQuery, tasks, projects])

//   const [realTimeNotifications, setRealTimeNotifications] = useState<Notification[]>([])

//   const addRealTimeNotification = useCallback((notification: Notification) => {
//     setRealTimeNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10
    
//     // Show toast notification
//     toast.success(notification.title, {
//       description: notification.message,
//       duration: 5000,
//     })
//   }, [])

//   const fetchProfile = async () => {
//     try {
//       setIsLoadingProfile(true)
//       const response = await fetch('/api/profile')
      
//       if (response.ok) {
//         const data = await response.json()
//         if (data.user) {
//           setProfile(data.user)
//         }
//       } else {
//         setProfile(createFallbackProfile())
//       }
//     } catch (error) {
//       console.error('Error loading profile:', error)
//       setProfile(createFallbackProfile())
//     } finally {
//       setIsLoadingProfile(false)
//     }
//   }

//   const fetchTasksAndProjects = async () => {
//     try {
//       setIsLoadingTasks(true)
      
//       const [tasksResponse, projectsResponse] = await Promise.all([
//         fetch('/api/tasks'),
//         fetch('/api/projects')
//       ])

//       if (tasksResponse.ok) {
//         const tasksData = await tasksResponse.json()
//         setTasks(tasksData.tasks || [])
//       }

//       if (projectsResponse.ok) {
//         const projectsData = await projectsResponse.json()
//         setProjects(projectsData.projects || [])
//       }
//     } catch (error) {
//       console.error('Error loading tasks/projects:', error)
//     } finally {
//       setIsLoadingTasks(false)
//     }
//   }

//   const performSearch = async (query: string) => {
//     setIsSearching(true)
    
//     try {
//       const results: SearchResult[] = []
      
//       // Search tasks
//       const taskMatches = tasks.filter(task => 
//         (task.name?.toLowerCase().includes(query.toLowerCase())) ||
//         (task.title?.toLowerCase().includes(query.toLowerCase())) ||
//         (task.module?.name?.toLowerCase().includes(query.toLowerCase())) ||
//         (task.taskType?.name?.toLowerCase().includes(query.toLowerCase()))
//       )
      
//       taskMatches.forEach(task => {
//         results.push({
//           id: task.id,
//           type: 'task',
//           title: task.name || task.title || 'Untitled Task',
//           subtitle: `${task.status} • ${task.priority} Priority`,
//           url: `/dashboard/tasks`,
//           icon: <FileText className="h-4 w-4" />
//         })
//       })

//       // Search projects
//       const projectMatches = projects.filter(project =>
//         project.name.toLowerCase().includes(query.toLowerCase())
//       )
      
//       projectMatches.forEach(project => {
//         results.push({
//           id: project.id,
//           type: 'project',
//           title: project.name,
//           subtitle: `Project • ${project.status}`,
//           url: `/dashboard/projects`,
//           icon: <FolderOpen className="h-4 w-4" />
//         })
//       })

//       setSearchResults(results.slice(0, 8)) // Limit to 8 results
//     } catch (error) {
//       console.error('Search error:', error)
//     } finally {
//       setIsSearching(false)
//     }
//   }

//   const createFallbackProfile = (): ProfileData => {
//     return {
//       id: session?.user?.id || '',
//       firstName: session?.user?.name?.split(' ')[0] || '',
//       lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
//       name: session?.user?.name || '',
//       email: session?.user?.email || '',
//       image: session?.user?.image || '',
//       role: 'EMPLOYEE'
//     }
//   }

//   const getDisplayName = (): string => {
//     if (isLoadingProfile) return 'Loading...'
    
//     if (!profile) {
//       return session?.user?.name || 'User'
//     }

//     if (profile.firstName || profile.lastName) {
//       const firstName = profile.firstName || ''
//       const lastName = profile.lastName || ''
//       const fullName = `${firstName} ${lastName}`.trim()
//       return fullName || 'User'
//     }
    
//     return profile.name || session?.user?.name || 'User'
//   }

//   const getDisplayEmail = (): string => {
//     return profile?.email || session?.user?.email || 'user@example.com'
//   }

//   const getDisplayImage = (): string => {
//     return profile?.image || session?.user?.image || ''
//   }

//   const getInitials = (): string => {
//     const name = getDisplayName()
//     if (!name || name === 'User' || name === 'Loading...') return '??'
    
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   // Generate notifications (combine real-time and data-based)
//   const notifications = useMemo((): Notification[] => {
//     if (isLoadingTasks) return realTimeNotifications
    
//     const dataNotifs: Notification[] = []
//     const now = new Date()

//     // Task overdue notifications
//     tasks.forEach(task => {
//       if (task.dueDate && task.status !== 'COMPLETED') {
//         const dueDate = new Date(task.dueDate)
//         if (dueDate < now) {
//           const timeAgo = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
//           dataNotifs.push({
//             id: `overdue-${task.id}`,
//             type: 'task_overdue',
//             title: 'Task Overdue',
//             message: `"${task.name || task.title}" was due ${timeAgo} day${timeAgo !== 1 ? 's' : ''} ago`,
//             timestamp: dueDate,
//             isRead: readNotifications.has(`overdue-${task.id}`),
//             priority: 'urgent',
//             actionUrl: '/dashboard/tasks',
//             taskId: task.id
//           })
//         }
//       }
//     })

//     // Task due soon notifications
//     tasks.forEach(task => {
//       if (task.dueDate && task.status !== 'COMPLETED') {
//         const dueDate = new Date(task.dueDate)
//         const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        
//         if (dueDate > now && dueDate < threeDaysFromNow) {
//           const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
//           dataNotifs.push({
//             id: `due-soon-${task.id}`,
//             type: 'task_due_soon',
//             title: 'Task Due Soon',
//             message: `"${task.name || task.title}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
//             timestamp: new Date(now.getTime() - 1000 * 60 * 60),
//             isRead: readNotifications.has(`due-soon-${task.id}`),
//             priority: task.priority === 'URGENT' ? 'urgent' : 'high',
//             actionUrl: '/dashboard/tasks',
//             taskId: task.id
//           })
//         }
//       }
//     })

//     // Project deadline notifications
//     projects.forEach(project => {
//       if (project.endDate && project.status === 'ACTIVE') {
//         const deadline = new Date(project.endDate)
//         const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
//         if (deadline > now && deadline < oneWeekFromNow) {
//           const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
//           dataNotifs.push({
//             id: `project-deadline-${project.id}`,
//             type: 'project_deadline',
//             title: 'Project Deadline Approaching',
//             message: `Project "${project.name}" deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
//             timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
//             isRead: readNotifications.has(`project-deadline-${project.id}`),
//             priority: 'high',
//             actionUrl: '/dashboard/projects',
//             projectId: project.id
//           })
//         }
//       }
//     })

//     // Combine real-time and data notifications
//     const allNotifications = [...realTimeNotifications, ...dataNotifs]

//     // Remove duplicates and sort
//     const uniqueNotifications = allNotifications.filter((notification, index, self) =>
//       index === self.findIndex(n => n.id === notification.id)
//     )

//     return uniqueNotifications.sort((a, b) => {
//       const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
//       const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
//       if (priorityDiff !== 0) return priorityDiff
//       return b.timestamp.getTime() - a.timestamp.getTime()
//     })
//   }, [tasks, projects, readNotifications, isLoadingTasks, realTimeNotifications])

//   const unreadCount = notifications.filter(n => !n.isRead).length

//   const getNotificationIcon = (type: Notification['type']) => {
//     switch (type) {
//       case 'task_overdue':
//         return <AlertCircle className="h-4 w-4 text-red-500" />
//       case 'task_due_soon':
//         return <Clock className="h-4 w-4 text-yellow-500" />
//       case 'project_deadline':
//         return <Target className="h-4 w-4 text-orange-500" />
//       case 'task_completed':
//         return <CheckCircle2 className="h-4 w-4 text-green-500" />
//       case 'task_created':
//         return <Plus className="h-4 w-4 text-blue-500" />
//       case 'task_status_changed':
//         return <Settings className="h-4 w-4 text-purple-500" />
//       case 'project_created':
//         return <FolderOpen className="h-4 w-4 text-purple-500" />
//       default:
//         return <Bell className="h-4 w-4 text-gray-500" />
//     }
//   }

//   const getPriorityColor = (priority: Notification['priority']) => {
//     switch (priority) {
//       case 'urgent':
//         return 'border-l-red-500 bg-red-50 dark:bg-red-950'
//       case 'high':
//         return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950'
//       case 'medium':
//         return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
//       case 'low':
//         return 'border-l-green-500 bg-green-50 dark:bg-green-950'
//       default:
//         return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950'
//     }
//   }

//   const markAsRead = (notificationId: string) => {
//     setReadNotifications(prev => new Set(prev).add(notificationId))
//   }

//   const markAllAsRead = () => {
//     setReadNotifications(new Set(notifications.map(n => n.id)))
//   }

//   const clearAllNotifications = () => {
//     setRealTimeNotifications([])
//     setReadNotifications(new Set())
//     toast.success('All notifications cleared', {
//       description: 'Your notification list has been cleared.',
//     })
//   }

//   const handleLogout = async () => {
//     toast.success("Signed out successfully! 👋", {
//       description: "You have been logged out. See you next time!",
//       duration: 3000,
//     })
    
//     setTimeout(() => {
//       signOut({ callbackUrl: '/login' })
//     }, 1000)
//   }

//   const handleSearchSelect = (result: SearchResult) => {
//     setSearchOpen(false)
//     setSearchQuery('')
//     router.push(result.url)
//   }

//   // Show loading state
//   if (status === 'loading') {
//     return (
//       <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
//         <div className="flex h-full items-center justify-center px-4">
//           <Loader2 className="h-6 w-6 animate-spin" />
//         </div>
//       </header>
//     )
//   }

//   // Show sign in prompt if not authenticated
//   if (!session) {
//     return (
//       <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
//         <div className="flex h-full items-center justify-between px-4">
//           <div className="flex items-center space-x-2">
//             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
//               <span className="text-primary-foreground font-bold text-sm">TF</span>
//             </div>
//             <span className="font-bold text-lg">TaskFlow</span>
//           </div>
//           <Button asChild>
//             <Link href="/login">Sign In</Link>
//           </Button>
//         </div>
//       </header>
//     )
//   }

//   const displayName = getDisplayName()
//   const displayEmail = getDisplayEmail()
//   const displayImage = getDisplayImage()
//   const userInitials = getInitials()

//   return (
//     <>
//       {/* FIXED HEADER */}
//       <header className="fixed top-0 left-0 right-0 z-[9999] w-full h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
//         <div className="flex h-full items-center justify-between px-4">
//           {/* Left side - Mobile menu + Logo */}
//           <div className="flex items-center space-x-4">
//             <Button
//               variant="ghost"
//               size="icon"
//               className="md:hidden"
//               onClick={toggle}
//             >
//               <Menu className="h-5 w-5" />
//             </Button>

//             <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
//               <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer">
//                 <span className="text-primary-foreground font-bold text-sm">TF</span>
//               </div>
//               <span className="hidden sm:inline-block font-bold text-lg cursor-pointer">TaskFlow</span>
//             </Link>
//           </div>

//           {/* Center - Search Button */}
//           <div className="flex-1 max-w-sm mx-4">
//             <Button
//               variant="outline"
//               className="w-full justify-start text-muted-foreground bg-muted/50"
//               onClick={() => setSearchOpen(true)}
//             >
//               <Search className="h-4 w-4 mr-2" />
//               <span className="hidden sm:inline">Search tasks, projects...</span>
//               <span className="sm:hidden">Search...</span>
//             </Button>
//           </div>

//           {/* Right side - Add Task + Icons */}
//           <div className="flex items-center space-x-3">
//             <Button size="sm" className="hidden sm:flex" asChild>
//               <Link href="/dashboard/tasks">
//                 <Plus className="h-4 w-4 mr-2" />
//                 Add Task
//               </Link>
//             </Button>

//             <div className="flex items-center space-x-1">
//               {/* Theme Toggle */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//                     <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="z-[10001]">
//                   <DropdownMenuItem onClick={() => setTheme('light')}>
//                     <Sun className="mr-2 h-4 w-4" />
//                     <span>Light</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setTheme('dark')}>
//                     <Moon className="mr-2 h-4 w-4" />
//                     <span>Dark</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setTheme('system')}>
//                     <Monitor className="mr-2 h-4 w-4" />
//                     <span>System</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               {/* DYNAMIC CHAT ICON */}
//               <DynamicChatHeaderIcon />

//               {/* Real-time Notifications */}
//               <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
//                 <PopoverTrigger asChild>
//                   <Button variant="ghost" size="icon" className="relative">
//                     <Bell className="h-5 w-5" />
//                     {unreadCount > 0 && (
//                       <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
//                         {unreadCount > 99 ? '99+' : unreadCount}
//                       </Badge>
//                     )}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent 
//                   className="w-80 p-0 mr-4 z-[10000]" 
//                   align="end"
//                   side="bottom"
//                   sideOffset={8}
//                 >
//                   <div className="border-b p-4 flex items-center justify-between">
//                     <h3 className="font-semibold">Notifications</h3>
//                     <div className="flex items-center gap-2">
//                       {unreadCount > 0 && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={markAllAsRead}
//                           className="text-xs"
//                         >
//                           Mark all read
//                         </Button>
//                       )}
//                       {notifications.length > 0 && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={clearAllNotifications}
//                           className="text-xs text-red-600 hover:text-red-700"
//                         >
//                           <Trash2 className="h-3 w-3 mr-1" />
//                           Clear all
//                         </Button>
//                       )}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => setNotificationsOpen(false)}
//                         className="h-6 w-6"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
                  
//                   <ScrollArea className="h-[400px]">
//                     {isLoadingTasks && notifications.length === 0 ? (
//                       <div className="p-8 text-center">
//                         <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
//                         <p className="text-sm text-muted-foreground">Loading notifications...</p>
//                       </div>
//                     ) : notifications.length === 0 ? (
//                       <div className="p-8 text-center text-muted-foreground">
//                         <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                         <p className="font-medium">No notifications</p>
//                         <p className="text-sm">You're all caught up!</p>
//                       </div>
//                     ) : (
//                       <div className="divide-y">
//                         {notifications.map((notification) => (
//                           <div
//                             key={notification.id}
//                             className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-2 ${
//                               getPriorityColor(notification.priority)
//                             } ${!notification.isRead ? 'font-medium' : 'opacity-75'}`}
//                             onClick={() => {
//                               markAsRead(notification.id)
//                               if (notification.actionUrl) {
//                                 router.push(notification.actionUrl)
//                                 setNotificationsOpen(false)
//                               }
//                             }}
//                           >
//                             <div className="flex items-start gap-3">
//                               <div className="mt-1">
//                                 {getNotificationIcon(notification.type)}
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <div className="flex items-center justify-between mb-1">
//                                   <p className="text-sm font-medium truncate">
//                                     {notification.title}
//                                   </p>
//                                   {!notification.isRead && (
//                                     <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
//                                   )}
//                                 </div>
//                                 <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
//                                   {notification.message}
//                                 </p>
//                                 <p className="text-xs text-muted-foreground">
//                                   {notification.timestamp.toLocaleString()}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </ScrollArea>
                  
//                   {notifications.length > 0 && (
//                     <div className="border-t p-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         className="w-full text-xs"
//                         asChild
//                       >
//                         <Link href="/dashboard">
//                           View Dashboard
//                         </Link>
//                       </Button>
//                     </div>
//                   )}
//                 </PopoverContent>
//               </Popover>

//               {/* User Menu - FIXED Z-INDEX */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
//                     <Avatar className="h-10 w-10 cursor-pointer">
//                       {displayImage ? (
//                         <AvatarImage 
//                           src={displayImage} 
//                           alt={displayName} 
//                           className="cursor-pointer"
//                         />
//                       ) : null}
//                       <AvatarFallback className="bg-primary text-primary-foreground cursor-pointer">
//                         {userInitials}
//                       </AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56 z-[10001]" align="end" forceMount>
//                   <DropdownMenuLabel className="font-normal">
//                     <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium leading-none">{displayName}</p>
//                       <p className="text-xs leading-none text-muted-foreground">
//                         {displayEmail}
//                       </p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem asChild>
//                     <Link href="/dashboard/settings">
//                       <User className="mr-2 h-4 w-4" />
//                       <span>Profile</span>
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link href="/dashboard/settings">
//                       <Settings className="mr-2 h-4 w-4" />
//                       <span>Settings</span>
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem 
//                     className="text-red-600 cursor-pointer"
//                     onClick={handleLogout}
//                   >
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>Log out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Search Dialog - FIXED Z-INDEX */}
//       <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
//         <DialogContent className="sm:max-w-[600px] p-0 z-[10002]">
//           <DialogHeader className="px-4 py-3 border-b">
//             <DialogTitle className="text-lg flex items-center gap-2">
//               <SearchIcon className="h-5 w-5" />
//               Search TaskFlow
//             </DialogTitle>
//           </DialogHeader>
          
//           <div className="p-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search tasks, projects, or content..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 text-base"
//                 autoFocus
//               />
//             </div>
            
//             {/* Search Results */}
//             <div className="mt-4 max-h-[400px] overflow-y-auto">
//               {isSearching ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="h-6 w-6 animate-spin" />
//                   <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
//                 </div>
//               ) : searchQuery.length > 1 && searchResults.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <p className="font-medium">No results found</p>
//                   <p className="text-sm">Try searching for tasks, projects, or other content</p>
//                 </div>
//               ) : searchResults.length > 0 ? (
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium text-muted-foreground px-2 mb-2">
//                     Results ({searchResults.length})
//                   </p>
//                   {searchResults.map((result) => (
//                     <div
//                       key={result.id}
//                       className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
//                       onClick={() => handleSearchSelect(result)}
//                     >
//                       <div className="flex-shrink-0 text-muted-foreground">
//                         {result.icon}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-sm truncate">{result.title}</p>
//                         {result.subtitle && (
//                           <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
//                         )}
//                       </div>
//                       <Badge variant="outline" className="text-xs">
//                         {result.type}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground px-2 mb-2">
//                       Quick Actions
//                     </p>
//                     <div className="space-y-1">
//                       <div
//                         className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
//                         onClick={() => {
//                           setSearchOpen(false)
//                           router.push('/dashboard/tasks')
//                         }}
//                       >
//                         <Plus className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm">Create new task</span>
//                       </div>
//                       <div
//                         className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
//                         onClick={() => {
//                           setSearchOpen(false)
//                           router.push('/dashboard/projects')
//                         }}
//                       >
//                         <FolderOpen className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm">View all projects</span>
//                       </div>
//                       <div
//                         className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
//                         onClick={() => {
//                           setSearchOpen(false)
//                           router.push('/dashboard/calendar')
//                         }}
//                       >
//                         <Calendar className="h-4 w-4 text-muted-foreground" />
//                         <span className="text-sm">Open calendar</span>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {tasks.length > 0 && (
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground px-2 mb-2">
//                         Recent Tasks
//                       </p>
//                       <div className="space-y-1">
//                         {tasks.slice(0, 3).map((task) => (
//                           <div
//                             key={task.id}
//                             className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
//                             onClick={() => {
//                               setSearchOpen(false)
//                               router.push('/dashboard/tasks')
//                             }}
//                           >
//                             <FileText className="h-4 w-4 text-muted-foreground" />
//                             <div className="flex-1 min-w-0">
//                               <p className="font-medium text-sm truncate">{task.name || task.title}</p>
//                               <p className="text-xs text-muted-foreground truncate">
//                                 {task.status} • {task.priority} Priority
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
            
//             {/* Search Tips */}
//             {searchQuery.length <= 1 && (
//               <div className="mt-6 pt-4 border-t">
//                 <p className="text-xs text-muted-foreground text-center">
//                   💡 Tip: Use keywords like "urgent", "overdue", or project names to find specific items
//                 </p>
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }

// export default Header



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