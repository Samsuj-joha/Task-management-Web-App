// src/components/tasks/task-kanban-optimized.tsx
'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUpdateTask, useDeleteTask, type Task } from '@/hooks/use-tasks'
import { 
  MoreHorizontal, Edit, Trash2, Eye, User, Flag, 
  Calendar, Clock, AlertTriangle, Plus, GripVertical
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TaskKanbanOptimizedProps {
  tasks: Task[]
  isLoading: boolean
  onEditTask?: (task: Task) => void
}

const statusColumns = [
  { 
    id: 'TODO', 
    title: 'To Do', 
    color: 'bg-gray-50 border-gray-200',
    headerColor: 'bg-gray-100 text-gray-700'
  },
  { 
    id: 'IN_PROGRESS', 
    title: 'In Progress', 
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-700'
  },
  { 
    id: 'IN_REVIEW', 
    title: 'In Review', 
    color: 'bg-purple-50 border-purple-200',
    headerColor: 'bg-purple-100 text-purple-700'
  },
  { 
    id: 'COMPLETED', 
    title: 'Completed', 
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-700'
  }
] as const

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200',
} as const

export function TaskKanbanOptimized({ tasks, isLoading, onEditTask }: TaskKanbanOptimizedProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  // 🚀 PERFORMANCE: Memoize tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = []
      }
      acc[task.status].push(task)
      return acc
    }, {} as Record<string, Task[]>)
    
    return grouped
  }, [tasks])

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragEnter = useCallback((columnId: string) => {
    setDragOverColumn(columnId)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDragOverColumn(null)
      return
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: draggedTask.id,
        data: { status: newStatus as any }
      })
      
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast.error('Failed to move task')
    } finally {
      setDragOverColumn(null)
    }
  }, [draggedTask, updateTaskMutation])

  const handleEditClick = useCallback((e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    e.preventDefault()
    onEditTask?.(task)
  }, [onEditTask])

  const handleDeleteTask = useCallback(async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }, [deleteTaskMutation])

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return null
    try {
      return format(new Date(dateString), 'MMM dd')
    } catch {
      return null
    }
  }, [])

  const isOverdue = useCallback((task: Task) => {
    return task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED'
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div key={column.id} className="space-y-4 animate-pulse">
            <div className="h-12 bg-muted rounded-lg" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statusColumns.map((column) => {
        const columnTasks = tasksByStatus[column.id] || []
        
        return (
          <div
            key={column.id}
            className={cn(
              "rounded-lg border-2 border-dashed transition-all duration-200 min-h-[600px]",
              column.color,
              dragOverColumn === column.id ? "border-blue-400 bg-blue-100 scale-105" : ""
            )}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={cn(
              "p-4 rounded-t-lg border-b sticky top-0 z-10",
              column.headerColor
            )}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className={cn(
                      "cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group",
                      "transform hover:scale-105",
                      draggedTask?.id === task.id ? "opacity-50 scale-95 rotate-3" : "",
                      isOverdue(task) ? "ring-2 ring-red-200 border-red-300" : ""
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <CardContent className="p-4">
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {task.title || task.name}
                          </h4>
                          
                          {/* Priority Badge */}
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs mb-2", priorityColors[task.priority])}
                          >
                            <Flag className="h-2 w-2 mr-1" />
                            {task.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => handleEditClick(e, task)}>
                                  <Eye className="mr-2 h-3 w-3" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => handleEditClick(e, task)}>
                                  <Edit className="mr-2 h-3 w-3" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => handleDeleteTask(e, task.id)}
                                  className="text-red-600 focus:text-red-600"
                                  disabled={deleteTaskMutation.isPending}
                                >
                                  <Trash2 className="mr-2 h-3 w-3" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {(task.description || task.comments) && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {task.description || task.comments}
                        </p>
                      )}

                      {/* Task Details */}
                      <div className="space-y-2">
                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex items-center gap-2 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{task.assignee.name}</span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex items-center justify-between text-xs">
                          {task.date && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(task.date)}</span>
                            </div>
                          )}
                          
                          {task.dueDate && (
                            <div className={cn(
                              "flex items-center gap-1",
                              isOverdue(task) ? "text-red-600 font-medium" : "text-muted-foreground"
                            )}>
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(task.dueDate)}</span>
                              {isOverdue(task) && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Project/Module Info */}
                        {(task.project?.name || task.module?.name) && (
                          <div className="pt-2 border-t">
                            {task.project?.name && (
                              <div className="text-xs text-muted-foreground truncate">
                                📁 {task.project.name}
                              </div>
                            )}
                            {task.module?.name && (
                              <div className="text-xs text-muted-foreground truncate">
                                🔧 {task.module.name}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status Indicators */}
                      {isOverdue(task) && (
                        <div className="mt-3 pt-2 border-t">
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <AlertTriangle className="h-2 w-2 mr-1" />
                            Overdue
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}