// src/app/dashboard/calendar/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTasks } from '@/hooks/use-tasks'
import { useProjects } from '@/hooks/use-projects'
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Users,
  Settings,
  Building2,
  FileText,
  FolderOpen
} from 'lucide-react'
import { format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  parseISO,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter
} from 'date-fns'
import Link from 'next/link'

type ViewMode = 'month' | 'week' | 'day'
type FilterType = 'all' | 'tasks' | 'projects' | 'deadlines' | 'overdue'

interface CalendarEvent {
  id: string
  title: string
  type: 'task' | 'project' | 'deadline'
  status: string
  priority: string
  date: Date
  dueDate?: Date
  module?: string
  taskType?: string
  devDept?: string
  trackingNo?: string
  project?: {
    id: string
    name: string
  }
  isOverdue?: boolean
  completedAt?: Date
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()

  const tasks = tasksData?.tasks || []
  const projects = projectsData?.projects || []
  const isLoading = tasksLoading || projectsLoading

  // Convert tasks and projects to calendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = []

    console.log('🔄 Calendar Data Debug:')
    console.log('📋 Tasks:', tasks.length, tasks)
    console.log('📂 Projects:', projects.length, projects)

    // Add tasks with better logging
    tasks.forEach(task => {
      console.log(`Processing task: ${task.name || task.title}`, task)
      
      // Task creation/start date event
      if (task.date || task.createdAt) {
        const date = task.date ? parseISO(task.date) : parseISO(task.createdAt)
        const taskEvent = {
          id: `task-${task.id}`,
          title: task.name || task.title,
          type: 'task' as const,
          status: task.status,
          priority: task.priority,
          date,
          dueDate: task.dueDate ? parseISO(task.dueDate) : undefined,
          module: task.module,
          taskType: task.taskType,
          devDept: task.devDept,
          trackingNo: task.trackingNo,
          project: task.project,
          completedAt: task.completedAt ? parseISO(task.completedAt) : undefined,
        }
        calendarEvents.push(taskEvent)
        console.log('✅ Added task event:', taskEvent)
      }

      // Task due date event (if different from creation date and exists)
      if (task.dueDate) {
        const dueDate = parseISO(task.dueDate)
        const creationDate = task.date ? parseISO(task.date) : parseISO(task.createdAt)
        
        // Only add separate due date event if it's different from creation date
        if (!isSameDay(dueDate, creationDate)) {
          const isOverdue = isBefore(dueDate, new Date()) && task.status !== 'COMPLETED'
          const deadlineEvent = {
            id: `deadline-${task.id}`,
            title: `📅 Due: ${task.name || task.title}`,
            type: 'deadline' as const,
            status: task.status,
            priority: task.priority,
            date: dueDate,
            dueDate,
            module: task.module,
            taskType: task.taskType,
            devDept: task.devDept,
            trackingNo: task.trackingNo,
            project: task.project,
            isOverdue,
            completedAt: task.completedAt ? parseISO(task.completedAt) : undefined,
          }
          calendarEvents.push(deadlineEvent)
          console.log('⏰ Added deadline event:', deadlineEvent)
        }
      }

      // Task completion event (if completed)
      if (task.completedAt) {
        const completionDate = parseISO(task.completedAt)
        const creationDate = task.date ? parseISO(task.date) : parseISO(task.createdAt)
        
        // Only add separate completion event if it's different from creation date
        if (!isSameDay(completionDate, creationDate)) {
          const completionEvent = {
            id: `completion-${task.id}`,
            title: `✅ Completed: ${task.name || task.title}`,
            type: 'task' as const,
            status: 'COMPLETED',
            priority: task.priority,
            date: completionDate,
            module: task.module,
            taskType: task.taskType,
            devDept: task.devDept,
            trackingNo: task.trackingNo,
            project: task.project,
            completedAt: completionDate,
          }
          calendarEvents.push(completionEvent)
          console.log('🎉 Added completion event:', completionEvent)
        }
      }
    })

    // Add projects with better logging
    projects.forEach(project => {
      console.log(`Processing project: ${project.name}`, project)
      
      // Project creation event
      const creationEvent = {
        id: `project-created-${project.id}`,
        title: `📂 Project: ${project.name}`,
        type: 'project' as const,
        status: project.status,
        priority: project.priority,
        date: parseISO(project.createdAt),
      }
      calendarEvents.push(creationEvent)
      console.log('📂 Added project creation event:', creationEvent)

      // Project start date (if different from creation)
      if (project.startDate) {
        const startDate = parseISO(project.startDate)
        const creationDate = parseISO(project.createdAt)
        
        if (!isSameDay(startDate, creationDate)) {
          const startEvent = {
            id: `project-start-${project.id}`,
            title: `🚀 Start: ${project.name}`,
            type: 'project' as const,
            status: project.status,
            priority: project.priority,
            date: startDate,
          }
          calendarEvents.push(startEvent)
          console.log('🚀 Added project start event:', startEvent)
        }
      }

      // Project deadline
      if (project.endDate) {
        const deadline = parseISO(project.endDate)
        const isOverdue = isBefore(deadline, new Date()) && project.status !== 'COMPLETED'
        
        const deadlineEvent = {
          id: `project-deadline-${project.id}`,
          title: `🎯 Project Due: ${project.name}`,
          type: 'deadline' as const,
          status: project.status,
          priority: project.priority,
          date: deadline,
          dueDate: deadline,
          isOverdue,
        }
        calendarEvents.push(deadlineEvent)
        console.log('🎯 Added project deadline event:', deadlineEvent)
      }
    })

    console.log('📊 Total calendar events generated:', calendarEvents.length)
    console.log('📅 All events:', calendarEvents)
    
    return calendarEvents
  }, [tasks, projects])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      switch (filter) {
        case 'tasks':
          return event.type === 'task'
        case 'projects':
          return event.type === 'project'
        case 'deadlines':
          return event.type === 'deadline'
        case 'overdue':
          return event.isOverdue || (event.dueDate && isBefore(event.dueDate, new Date()) && !event.completedAt)
        default:
          return true
      }
    })
  }, [events, filter])

  // Get calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate))
    const end = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Get events for specific day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, day))
  }

  // Get event color based on type and priority
  const getEventColor = (event: CalendarEvent) => {
    if (event.isOverdue) return 'bg-red-500 text-white'
    if (event.completedAt) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    
    switch (event.type) {
      case 'task':
        return event.priority === 'URGENT' 
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          : event.priority === 'HIGH'
          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'deadline':
        return event.isOverdue 
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  // Get event icon
  const getEventIcon = (event: CalendarEvent) => {
    if (event.completedAt) return CheckCircle2
    if (event.isOverdue) return AlertCircle
    
    switch (event.type) {
      case 'task':
        return Clock
      case 'project':
        return FolderOpen
      case 'deadline':
        return Target
      default:
        return CalendarIcon
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDialogOpen(true)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  // Calculate stats with better filtering
  const stats = {
    totalEvents: filteredEvents.length,
    upcomingDeadlines: filteredEvents.filter(e => 
      e.type === 'deadline' && 
      isAfter(e.date, new Date()) && 
      !e.completedAt
    ).length,
    overdueItems: filteredEvents.filter(e => 
      e.isOverdue || 
      (e.dueDate && isBefore(e.dueDate, new Date()) && e.status !== 'COMPLETED' && !e.completedAt)
    ).length,
    completedToday: filteredEvents.filter(e => 
      e.completedAt && isSameDay(e.completedAt, new Date())
    ).length,
    tasksCount: tasks.length,
    projectsCount: projects.length,
    inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
  }

  // Debug stats
  console.log('📊 Calendar Stats:', stats)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Track tasks, projects, and deadlines in calendar view
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="tasks">Tasks Only</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
              <SelectItem value="deadlines">Deadlines</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          
          <Button asChild>
            <Link href="/dashboard/tasks">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calendar Events</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Tasks: {stats.tasksCount} | Projects: {stats.projectsCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Active tasks being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${stats.overdueItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.overdueItems}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.overdueItems > 0 ? 'Require immediate action' : 'All on track'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total completed tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="aspect-square">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => {
                  const dayEvents = getEventsForDay(day)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isTodayDate = isToday(day)
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
                        isTodayDate
                          ? 'bg-primary/10 border-primary'
                          : isCurrentMonth
                          ? 'bg-background hover:bg-muted/50'
                          : 'bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isTodayDate ? 'text-primary' : ''
                      }`}>
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => {
                          const EventIcon = getEventIcon(event)
                          return (
                            <button
                              key={event.id}
                              onClick={() => handleEventClick(event)}
                              className={`w-full text-left p-1 rounded text-xs font-medium truncate transition-colors hover:opacity-80 ${getEventColor(event)}`}
                            >
                              <div className="flex items-center gap-1">
                                <EventIcon className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{event.title}</span>
                              </div>
                            </button>
                          )
                        })}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  {(() => {
                    const EventIcon = getEventIcon(selectedEvent)
                    return <EventIcon className="h-5 w-5" />
                  })()}
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(selectedEvent.date, 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getEventColor(selectedEvent)}>
                  {selectedEvent.type.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {selectedEvent.priority}
                </Badge>
                <Badge variant="outline">
                  {selectedEvent.status.replace('_', ' ')}
                </Badge>
                {selectedEvent.isOverdue && (
                  <Badge variant="destructive">
                    OVERDUE
                  </Badge>
                )}
              </div>
              
              {/* Event Details */}
              <div className="space-y-3 text-sm">
                {selectedEvent.module && (
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Module:</span>
                    <span>{selectedEvent.module}</span>
                  </div>
                )}
                
                {selectedEvent.taskType && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedEvent.taskType}</span>
                  </div>
                )}
                
                {selectedEvent.devDept && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Department:</span>
                    <span>{selectedEvent.devDept}</span>
                  </div>
                )}
                
                {selectedEvent.trackingNo && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="font-mono">{selectedEvent.trackingNo}</span>
                  </div>
                )}
                
                {selectedEvent.project && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Project:</span>
                    <Link 
                      href={`/dashboard/projects/${selectedEvent.project.id}`}
                      className="text-primary hover:underline"
                    >
                      {selectedEvent.project.name}
                    </Link>
                  </div>
                )}
                
                {selectedEvent.dueDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Due Date:</span>
                    <span className={selectedEvent.isOverdue ? 'text-red-600 font-medium' : ''}>
                      {format(selectedEvent.dueDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                
                {selectedEvent.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="text-green-600">
                      {format(selectedEvent.completedAt, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedEvent.type === 'task' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/tasks`}>
                      View Tasks
                    </Link>
                  </Button>
                )}
                {selectedEvent.type === 'project' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/projects`}>
                      View Projects
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}