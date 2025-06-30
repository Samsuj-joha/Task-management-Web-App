// src/components/tasks/task-list.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskCard } from './task-card'
import { TaskFilters } from './task-filters'
import { useTasks, type TaskFilters as TaskFiltersType } from '@/hooks/use-tasks'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, RefreshCw } from 'lucide-react'

interface TaskListProps {
  onCreateTask: () => void
  onEditTask: (task: any) => void
}

export function TaskList({ onCreateTask, onEditTask }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFiltersType>({})
  const { data: tasksData, isLoading, error, refetch } = useTasks(filters)
  const tasks = tasksData?.tasks || []

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
          <p className="text-red-600">Error loading tasks. Please try again.</p>
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
            {tasks.length > 0 && ` • ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={onCreateTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        taskCounts={{
          all: tasks.length,
          todo: tasks.filter(t => t.status === 'TODO').length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
          completed: tasks.filter(t => t.status === 'COMPLETED').length,
          cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
        }}
      />

      {/* Tasks Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                />
              ))}
            </div>
            
            {/* Debug Info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Task Status Summary:</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>TODO: {tasks.filter(t => t.status === 'TODO').length}</div>
                <div>IN_PROGRESS: {tasks.filter(t => t.status === 'IN_PROGRESS').length}</div>
                <div>IN_REVIEW: {tasks.filter(t => t.status === 'IN_REVIEW').length}</div>
                <div>COMPLETED: {tasks.filter(t => t.status === 'COMPLETED').length}</div>
                <div>CANCELLED: {tasks.filter(t => t.status === 'CANCELLED').length}</div>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.keys(filters).length > 0 
                  ? 'Try adjusting your filters or create a new task'
                  : 'Get started by creating your first task'
                }
              </p>
              <Button onClick={onCreateTask}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}