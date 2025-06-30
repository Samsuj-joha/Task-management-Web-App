// src/app/dashboard/time/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useTimeEntries, type TimeEntry } from '@/hooks/use-time-entries'
import { useTasks } from '@/hooks/use-tasks'
import { useProjects } from '@/hooks/use-projects'
import { toast } from 'sonner'
import { 
  Clock, Play, Pause, Square, Plus, Search, Filter, MoreHorizontal, 
  Calendar, Timer, Activity, Target, TrendingUp, AlertCircle,
  Edit, Trash2, CheckCircle2, DollarSign
} from 'lucide-react'
import { format, parseISO, startOfDay, endOfDay, isToday, differenceInMinutes } from 'date-fns'

type FilterType = 'today' | 'week' | 'month' | 'all'

// Time categories
const TIME_CATEGORIES = [
  'Development',
  'Testing', 
  'Bug Fixing',
  'Code Review',
  'Meeting',
  'Documentation',
  'Research',
  'Planning',
  'Other'
]

export default function TimeTrackingPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('today')
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  
  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [currentDuration, setCurrentDuration] = useState(0)
  const [timerDescription, setTimerDescription] = useState('')
  const [timerTask, setTimerTask] = useState('')
  const [timerProject, setTimerProject] = useState('')
  const [timerCategory, setTimerCategory] = useState('Development')

  // Form data
  const [formData, setFormData] = useState({
    description: '',
    duration: '',
    startTime: '',
    endTime: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category: 'Development',
    billable: true,
    taskId: '',
    projectId: ''
  })

  // API calls
  const { 
    data: timeData, 
    isLoading, 
    error, 
    refetch, 
    createTimeEntry, 
    updateTimeEntry, 
    deleteTimeEntry 
  } = useTimeEntries({
    search: searchQuery,
    filter: filterType
  })

  const { data: tasksData } = useTasks()
  const { data: projectsData } = useProjects()

  const timeEntries = timeData?.timeEntries || []
  const tasks = tasksData?.tasks || []
  const projects = projectsData?.projects || []

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setCurrentDuration(differenceInMinutes(new Date(), startTime))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, startTime])

  // Time statistics
  const timeStats = useMemo(() => {
    const today = new Date()
    const todayEntries = timeEntries.filter(entry => isToday(parseISO(entry.date)))
    
    const totalToday = todayEntries.reduce((sum, entry) => sum + entry.duration, 0) + (isRunning ? currentDuration : 0)
    const totalWeek = timeEntries.filter(entry => {
      const entryDate = parseISO(entry.date)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      return entryDate >= startOfWeek
    }).reduce((sum, entry) => sum + entry.duration, 0)
    
    const billableToday = todayEntries.filter(e => e.billable).reduce((sum, entry) => sum + entry.duration, 0)
    const activeProjects = new Set(timeEntries.filter(e => e.projectId).map(e => e.projectId)).size

    return {
      totalToday: Math.round(totalToday),
      totalWeek: Math.round(totalWeek),
      billableToday: Math.round(billableToday),
      activeProjects,
      entriesCount: timeEntries.length
    }
  }, [timeEntries, currentDuration, isRunning])

  // Timer functions
  const startTimer = () => {
    setStartTime(new Date())
    setIsRunning(true)
    setCurrentDuration(0)
  }

  const stopTimer = async () => {
    if (!startTime) return

    const endTime = new Date()
    const duration = differenceInMinutes(endTime, startTime)

    if (duration < 1) {
      toast.error('Timer must run for at least 1 minute')
      return
    }

    const timeEntryData = {
      description: timerDescription || 'Timer session',
      duration,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      date: format(startTime, 'yyyy-MM-dd'),
      category: timerCategory,
      billable: true,
      taskId: timerTask || null,
      projectId: timerProject || null
    }

    const success = await createTimeEntry(timeEntryData)
    if (success) {
      setIsRunning(false)
      setStartTime(null)
      setCurrentDuration(0)
      setTimerDescription('')
      setTimerTask('')
      setTimerProject('')
      toast.success(`Timer stopped! Logged ${duration} minutes`)
    }
  }

  const pauseTimer = () => {
    if (!startTime) return
    
    // Save current session
    const duration = differenceInMinutes(new Date(), startTime)
    setCurrentDuration(prev => prev + duration)
    setIsRunning(false)
    setStartTime(null)
  }

  const resumeTimer = () => {
    setStartTime(new Date())
    setIsRunning(true)
  }

  // Form handlers
  const resetForm = () => {
    setFormData({
      description: '',
      duration: '',
      startTime: '',
      endTime: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category: 'Development',
      billable: true,
      taskId: '',
      projectId: ''
    })
  }

  const handleAddEntry = async () => {
    if (!formData.description.trim() || !formData.duration) {
      toast.error('Description and duration are required')
      return
    }

    const duration = parseInt(formData.duration)
    if (duration <= 0) {
      toast.error('Duration must be greater than 0')
      return
    }

    // Calculate start and end times if not provided
    let startTime = formData.startTime
    let endTime = formData.endTime

    if (!startTime || !endTime) {
      const now = new Date()
      endTime = format(now, "HH:mm")
      const start = new Date(now.getTime() - (duration * 60 * 1000))
      startTime = format(start, "HH:mm")
    }

    const entryData = {
      ...formData,
      duration,
      startTime: `${formData.date}T${startTime}:00`,
      endTime: `${formData.date}T${endTime}:00`,
      taskId: formData.taskId || null,
      projectId: formData.projectId || null
    }

    const success = await createTimeEntry(entryData)
    if (success) {
      setIsAddEntryOpen(false)
      resetForm()
    }
  }

  const handleEditEntry = async () => {
    if (!selectedEntry || !formData.description.trim() || !formData.duration) {
      toast.error('Description and duration are required')
      return
    }

    const duration = parseInt(formData.duration)
    if (duration <= 0) {
      toast.error('Duration must be greater than 0')
      return
    }

    const updateData = {
      ...formData,
      duration,
      startTime: `${formData.date}T${formData.startTime}:00`,
      endTime: `${formData.date}T${formData.endTime}:00`,
      taskId: formData.taskId || null,
      projectId: formData.projectId || null
    }

    const success = await updateTimeEntry(selectedEntry.id, updateData)
    if (success) {
      setIsEditOpen(false)
      setSelectedEntry(null)
      resetForm()
    }
  }

  const handleDeleteEntry = async (entry: TimeEntry) => {
    if (confirm(`Are you sure you want to delete this time entry?`)) {
      await deleteTimeEntry(entry.id)
    }
  }

  const openEditDialog = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    setFormData({
      description: entry.description || '',
      duration: entry.duration.toString(),
      startTime: format(parseISO(entry.startTime), 'HH:mm'),
      endTime: format(parseISO(entry.endTime), 'HH:mm'),
      date: entry.date,
      category: entry.category || 'Development',
      billable: entry.billable,
      taskId: entry.taskId || '',
      projectId: entry.projectId || ''
    })
    setIsEditOpen(true)
  }

  // Utility functions
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getCurrentTimerDisplay = () => {
    const totalMinutes = currentDuration + (isRunning && startTime ? 
      differenceInMinutes(new Date(), startTime) : 0)
    return formatDuration(totalMinutes)
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Time Entries</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track time spent on tasks and projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
                <DialogDescription>Log time spent on work</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What did you work on?"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="120"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="task">Task (Optional)</Label>
                    <Select value={formData.taskId} onValueChange={(value) => setFormData(prev => ({ ...prev, taskId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No task</SelectItem>
                        {tasks.map(task => (
                          <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="project">Project (Optional)</Label>
                    <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="billable"
                    checked={formData.billable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked }))}
                  />
                  <Label htmlFor="billable">Billable</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setIsAddEntryOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>
                    Add Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Timer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Active Timer
          </CardTitle>
          <CardDescription>
            Start tracking time for your current work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-3xl font-bold font-mono">
                {getCurrentTimerDisplay()}
              </div>
              {isRunning && (
                <div className="text-sm text-muted-foreground">
                  Started at {startTime ? format(startTime, 'HH:mm') : '--:--'}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              ) : (
                <>
                  <Button onClick={pauseTimer} variant="outline" size="lg">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={stopTimer} size="lg">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {isRunning && (
            <div className="mt-4 space-y-2">
              <Input
                placeholder="What are you working on?"
                value={timerDescription}
                onChange={(e) => setTimerDescription(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                <Select value={timerCategory} onValueChange={setTimerCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={timerTask} onValueChange={setTimerTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No task</SelectItem>
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={timerProject} onValueChange={setTimerProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{formatDuration(timeStats.totalToday)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDuration(timeStats.billableToday)} billable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{formatDuration(timeStats.totalWeek)}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{timeStats.activeProjects}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Projects with time logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{timeStats.entriesCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Time entries logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search time entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Entries List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : timeEntries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No time entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Start tracking time or add manual entries'}
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={startTimer}>
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
              <Button variant="outline" onClick={() => setIsAddEntryOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{entry.description}</h3>
                      {entry.billable && (
                        <Badge variant="default">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Billable
                        </Badge>
                      )}
                      <Badge variant="outline">{entry.category}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{format(parseISO(entry.date), 'MMM dd, yyyy')}</span>
                      <span>
                        {format(parseISO(entry.startTime), 'HH:mm')} - {format(parseISO(entry.endTime), 'HH:mm')}
                      </span>
                      {entry.task && (
                        <Badge variant="secondary">Task: {entry.task.title}</Badge>
                      )}
                      {entry.project && (
                        <Badge variant="secondary">Project: {entry.project.name}</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatDuration(entry.duration)}</div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(entry)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEntry(entry)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Entry Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>Update time entry details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task">Task (Optional)</Label>
                <Select value={formData.taskId} onValueChange={(value) => setFormData(prev => ({ ...prev, taskId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No task</SelectItem>
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-project">Project (Optional)</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-billable"
                checked={formData.billable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked }))}
              />
              <Label htmlFor="edit-billable">Billable</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEditEntry}>
                Update Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}