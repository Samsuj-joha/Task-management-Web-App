// src/hooks/use-tasks-optimized.ts - PERFORMANCE OPTIMIZED VERSION
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface Task {
  id: string
  title?: string
  name?: string
  description?: string
  comments?: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  date?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  assignee?: {
    id: string
    name: string
    email: string
    image?: string
  }
  creator?: {
    id: string
    name: string
    email: string
    image?: string
  }
  project?: {
    id: string
    name: string
    status: string
  }
  module?: {
    id: string
    name: string
  }
  // Add other fields as needed
}

export interface TaskFilters {
  status?: string
  priority?: string
  assigneeId?: string
  projectId?: string
  search?: string
  module?: string
  taskType?: string
  devDept?: string
}

export interface CreateTaskData {
  title: string
  name?: string
  description?: string
  status?: Task['status']
  priority?: Task['priority']
  assigneeId?: string
  projectId?: string
  date?: string
  dueDate?: string
  moduleId?: string
  devDeptId?: string
  taskTypeId?: string
  subTaskId?: string
  modifyId?: string
  referenceId?: string
  trackingNo?: string
  solveDate?: string
  sentBy?: string
  comments?: string
  tags?: string[]
}

// 🚀 PERFORMANCE: Optimized fetch function with minimal data
const fetchTasks = async (filters: TaskFilters = {}): Promise<{ tasks: Task[], total: number }> => {
  const params = new URLSearchParams()
  
  // Only add non-empty filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.append(key, value)
    }
  })

  const response = await fetch(`/api/tasks?${params.toString()}`, {
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`)
  }
  
  const data = await response.json()
  return {
    tasks: data.tasks || [],
    total: data.total || 0
  }
}

const createTask = async (taskData: CreateTaskData): Promise<Task> => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create task')
  }
  
  const data = await response.json()
  return data.task
}

const updateTask = async ({ id, data }: { id: string, data: Partial<CreateTaskData> }): Promise<Task> => {
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
  
  const result = await response.json()
  return result.task
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

// 🚀 PERFORMANCE: Optimized query hook with smart caching
export function useTasks(filters: TaskFilters = {}, options = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 2,
    ...options,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // 🚀 PERFORMANCE: Optimistic updates
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return { tasks: [newTask], total: 1 }
        return {
          tasks: [newTask, ...old.tasks],
          total: old.total + 1
        }
      })
      
      // Invalidate all task queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Task created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create task')
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      // 🚀 PERFORMANCE: Update specific task in cache
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          )
        }
      })
      
      // Invalidate queries to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Task updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update task')
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, deletedId) => {
      // 🚀 PERFORMANCE: Remove task from cache
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          tasks: old.tasks.filter((task: Task) => task.id !== deletedId),
          total: old.total - 1
        }
      })
      
      // Invalidate queries to ensure all views are updated
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Task deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task')
    },
  })
}

// 🚀 PERFORMANCE: Batch operations for multiple tasks
export function useBatchUpdateTasks() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (updates: Array<{ id: string, data: Partial<CreateTaskData> }>) => {
      const promises = updates.map(update => updateTask(update))
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tasks updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tasks')
    },
  })
}