// src/hooks/use-tasks.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
interface Task {
  id: string
  name: string
  date?: string
  module?: string
  devDept?: string
  taskType?: string
  subTask?: string
  modify?: string
  reference?: string
  trackingNo?: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
  solveDate?: string
  sentBy?: string
  comments?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  creator: {
    id: string
    name: string
    email: string
    department?: string
  }
  assignee?: {
    id: string
    name: string
    email: string
    department?: string
  }
  project?: {
    id: string
    name: string
    status: string
  }
  tags?: Array<{
    tag: {
      id: string
      name: string
      color: string
    }
  }>
  _count?: {
    comments: number
  }
}

interface TaskFilters {
  status?: string
  priority?: string
  projectId?: string
  search?: string
  module?: string
  taskType?: string
  devDept?: string
}

interface CreateTaskData {
  name: string
  date?: string
  module?: string
  devDept?: string
  taskType?: string
  subTask?: string
  modify?: string
  reference?: string
  trackingNo?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
  solveDate?: string
  sentBy?: string
  comments?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  assigneeId?: string
  projectId?: string
  tags?: string[]
}

interface UpdateTaskData {
  name?: string
  date?: string
  module?: string
  devDept?: string
  taskType?: string
  subTask?: string
  modify?: string
  reference?: string
  trackingNo?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
  solveDate?: string
  sentBy?: string
  comments?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  assigneeId?: string
  projectId?: string
}

// API Functions
const fetchTasks = async (filters: TaskFilters = {}): Promise<{ tasks: Task[] }> => {
  const params = new URLSearchParams()
  
  if (filters.status) params.append('status', filters.status)
  if (filters.priority) params.append('priority', filters.priority)
  if (filters.projectId) params.append('projectId', filters.projectId)
  if (filters.search) params.append('search', filters.search)
  if (filters.module) params.append('module', filters.module)
  if (filters.taskType) params.append('taskType', filters.taskType)
  if (filters.devDept) params.append('devDept', filters.devDept)

  const response = await fetch(`/api/tasks?${params.toString()}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }
  
  return response.json()
}

const fetchTask = async (id: string): Promise<{ task: Task }> => {
  const response = await fetch(`/api/tasks/${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch task')
  }
  
  return response.json()
}

const createTask = async (data: CreateTaskData): Promise<{ task: Task }> => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create task')
  }
  
  return response.json()
}

const updateTask = async ({ id, data }: { id: string; data: UpdateTaskData }): Promise<{ task: Task }> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update task')
  }
  
  return response.json()
}

const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete task')
  }
}

// Custom Hooks
export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully! 📝', {
        description: `"${data.task.name}" has been added to your tasks.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create task', {
        description: error.message,
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTask,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks'])
      
      // Optimistically update the cache
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old?.tasks) return old
        
        const updatedTasks = old.tasks.map((task: any) =>
          task.id === variables.id 
            ? { ...task, ...variables.data, updatedAt: new Date().toISOString() }
            : task
        )
        return { ...old, tasks: updatedTasks }
      })
      
      return { previousTasks }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      toast.error('Failed to update task', {
        description: err.message,
      })
    },
    onSuccess: (data, variables) => {
      // Update the cache with server response
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old?.tasks) return old
        
        const updatedTasks = old.tasks.map((task: any) =>
          task.id === variables.id ? data.task : task
        )
        return { ...old, tasks: updatedTasks }
      })
      
      toast.success('Task updated successfully! ✅', {
        description: `Status changed to ${data.task.status.replace('_', ' ')}`,
      })
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully! 🗑️', {
        description: 'The task has been removed from your list.',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to delete task', {
        description: error.message,
      })
    },
  })
}

// Export types
export type { Task, TaskFilters, CreateTaskData, UpdateTaskData }