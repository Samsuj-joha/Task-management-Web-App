// src/components/tasks/task-list.tsx (Enhanced Version)
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskCard } from './task-card'
import { TaskFilters } from './task-filters'
import { useTasks, type TaskFilters as TaskFiltersType } from '@/hooks/use-tasks'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Plus, RefreshCw, Search, LayoutGrid, Filter, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListProps {
  onCreateTask: () => void
  onEditTask: (task: any) => void
}

export function TaskList({ onCreateTask, onEditTask }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFiltersType>({})
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const { data: tasksData, isLoading, error, refetch } = useTasks(filters)
  const tasks = tasksData?.tasks || []

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      task.name?.toLowerCase().includes(searchLower) ||
      task.title?.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower) ||
      task.comments?.toLowerCase().includes(searchLower) ||
      task.module?.toLowerCase().includes(searchLower) ||
      task.taskType?.toLowerCase().includes(searchLower) ||
      task.subTask?.toLowerCase().includes(searchLower) ||
      task.reference?.toLowerCase().includes(searchLower)
    )
  })

  // Handle task expansion with auto-close functionality
  const handleExpandChange = useCallback((taskId: string, expanded: boolean) => {
    if (expanded) {
      // Close any currently expanded card and open the new one
      setExpandedTaskId(taskId)
    } else {
      // Close the expanded card
      setExpandedTaskId(null)
    }
  }, [])

  // Task status counts for summary
  const taskCounts = {
    all: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'TODO').length,
    inProgress: filteredTasks.filter(t => t.status === 'IN_PROGRESS').length,
    inReview: filteredTasks.filter(t => t.status === 'IN_REVIEW').length,
    completed: filteredTasks.filter(t => t.status === 'COMPLETED').length,
    cancelled: filteredTasks.filter(t => t.status === 'CANCELLED').length,
    overdue: filteredTasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'COMPLETED'
    ).length,
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and track progress</p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Tasks</h3>
          <p className="text-red-600">Error loading tasks. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track progress
            {filteredTasks.length > 0 && (
              <span className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={onCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-muted/50 px-3 py-2 rounded-lg text-center">
          <div className="text-lg font-semibold">{taskCounts.all}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950 px-3 py-2 rounded-lg text-center">
          <div className="text-lg font-semibold text-blue-600">{taskCounts.inProgress}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg text-center">
          <div className="text-lg font-semibold text-gray-600">{taskCounts.todo}</div>
          <div className="text-xs text-muted-foreground">Todo</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950 px-3 py-2 rounded-lg text-center">
          <div className="text-lg font-semibold text-green-600">{taskCounts.completed}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 px-3 py-2 rounded-lg text-center">
          <div className="text-lg font-semibold text-yellow-600">{taskCounts.inReview}</div>
          <div className="text-xs text-muted-foreground">Review</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg text-center">
          <div className="text-lg font-semibold text-red-600">{taskCounts.cancelled}</div>
          <div className="text-xs text-muted-foreground">Cancelled</div>
        </div>
        {taskCounts.overdue > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950 px-3 py-2 rounded-lg text-center animate-pulse">
            <div className="text-lg font-semibold text-orange-600">{taskCounts.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        )}
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          {expandedTaskId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedTaskId(null)}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Close All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-muted/20">
          <TaskFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            taskCounts={taskCounts}
          />
        </div>
      )}

      {/* Tasks Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[320px]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  isExpanded={expandedTaskId === task.id}
                  onExpandChange={handleExpandChange}
                />
              ))}
            </div>
            
            {/* Summary Footer */}
            <div className="mt-8 text-center text-sm text-muted-foreground">
              <p>
                Showing {filteredTasks.length} of {tasks.length} total tasks
                {searchTerm && ` matching "${searchTerm}"`}
                {Object.keys(filters).length > 0 && ` with applied filters`}
              </p>
              
              {/* Progress Summary */}
              {taskCounts.all > 0 && (
                <div className="mt-3 flex justify-center">
                  <div className="bg-muted rounded-full px-4 py-2 text-xs">
                    <span className="font-medium">
                      Progress: {Math.round((taskCounts.completed / taskCounts.all) * 100)}% complete
                    </span>
                    <span className="ml-3 text-muted-foreground">
                      ({taskCounts.completed}/{taskCounts.all} tasks)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No tasks match your search' : 'No tasks found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? `Try adjusting your search term "${searchTerm}" or create a new task.`
                  : Object.keys(filters).length > 0 
                    ? 'Try adjusting your filters or create a new task to get started.'
                    : 'Get started by creating your first task and organizing your work.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                )}
                {Object.keys(filters).length > 0 && (
                  <Button variant="outline" onClick={() => setFilters({})}>
                    Clear Filters
                  </Button>
                )}
                <Button onClick={onCreateTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}