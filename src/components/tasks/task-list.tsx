// src/components/tasks/task-list.tsx - UPDATED WITH ACTION MENU
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskActionMenu } from './task-action-menu'
import { TaskFilters } from './task-filters'
import { useTasks, type Task } from '@/hooks/use-tasks'
import { 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Flag,
  CheckCircle2,
  XCircle,
  Pause,
  AlertCircle
} from 'lucide-react'
import { format, isToday, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskListProps {
  onCreateTask: () => void
  onEditTask: (task: Task) => void
  onViewTask?: (task: Task) => void
}

export function TaskList({ onCreateTask, onEditTask, onViewTask }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Fetch tasks with search
  const { data: tasksData, isLoading, error } = useTasks({
    search: searchQuery,
    // Add other filters here
  })

  const tasks = tasksData?.tasks || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Pause className="h-4 w-4" />
      case 'IN_REVIEW':
        return <AlertCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = (task: Task) => {
    return task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Tasks</h3>
            <p className="text-muted-foreground">{error}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your tasks efficiently
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={onCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Component */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <TaskFilters />
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first task'}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                isOverdue(task) && "border-red-200 bg-red-50/50"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate">
                      {task.name || task.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {task.trackingNo && (
                        <span className="text-xs text-muted-foreground font-mono">
                          #{task.trackingNo}
                        </span>
                      )}
                      {task.module?.name && (
                        <Badge variant="outline" className="text-xs">
                          {task.module.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Menu - This replaces the direct edit button */}
                  <TaskActionMenu
                    task={task}
                    onEdit={onEditTask}
                    onView={onViewTask}
                  />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Description */}
                {(task.description || task.comments) && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {task.description || task.comments}
                  </p>
                )}

                {/* Status and Priority */}
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{task.status.replace('_', ' ')}</span>
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                </div>

                {/* Task Details */}
                <div className="space-y-2 text-sm">
                  {task.taskType?.name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Type:</span>
                      <span>{task.taskType.name}</span>
                    </div>
                  )}
                  
                  {task.devDept?.name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Dept:</span>
                      <span>{task.devDept.name}</span>
                    </div>
                  )}

                  {task.assignee && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{task.assignee.name || task.assignee.email}</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {task.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {format(new Date(task.date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1",
                      isOverdue(task) ? "text-red-600 font-medium" : "",
                      isToday(new Date(task.dueDate)) ? "text-orange-600 font-medium" : ""
                    )}>
                      <Clock className="h-3 w-3" />
                      <span>
                        Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        {isOverdue(task) && " (Overdue)"}
                        {isToday(new Date(task.dueDate)) && " (Today)"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Indicator */}
                {task.status === 'IN_PROGRESS' && (
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-600 h-1 rounded-full w-1/2"></div>
                  </div>
                )}

                {/* Overdue Warning */}
                {isOverdue(task) && (
                  <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                    <AlertCircle className="h-3 w-3" />
                    <span>Task is overdue</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}