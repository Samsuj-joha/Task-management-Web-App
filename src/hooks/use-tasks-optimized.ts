// // src/hooks/use-tasks-optimized.ts - PERFORMANCE OPTIMIZED VERSION
// 'use client'

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'

// export interface Task {
//   id: string
//   title?: string
//   name?: string
//   description?: string
//   comments?: string
//   status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
//   priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   date?: string
//   dueDate?: string
//   createdAt: string
//   updatedAt: string
//   completedAt?: string
//   assignee?: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
//   creator?: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
//   project?: {
//     id: string
//     name: string
//     status: string
//   }
//   module?: {
//     id: string
//     name: string
//   }
//   // Add other fields as needed
// }

// export interface TaskFilters {
//   status?: string
//   priority?: string
//   assigneeId?: string
//   projectId?: string
//   search?: string
//   module?: string
//   taskType?: string
//   devDept?: string
// }

// export interface CreateTaskData {
//   title: string
//   name?: string
//   description?: string
//   status?: Task['status']
//   priority?: Task['priority']
//   assigneeId?: string
//   projectId?: string
//   date?: string
//   dueDate?: string
//   moduleId?: string
//   devDeptId?: string
//   taskTypeId?: string
//   subTaskId?: string
//   modifyId?: string
//   referenceId?: string
//   trackingNo?: string
//   solveDate?: string
//   sentBy?: string
//   comments?: string
//   tags?: string[]
// }

// // 🚀 PERFORMANCE: Optimized fetch function with minimal data
// const fetchTasks = async (filters: TaskFilters = {}): Promise<{ tasks: Task[], total: number }> => {
//   const params = new URLSearchParams()
  
//   // Only add non-empty filters
//   Object.entries(filters).forEach(([key, value]) => {
//     if (value && value !== 'all') {
//       params.append(key, value)
//     }
//   })

//   const response = await fetch(`/api/tasks?${params.toString()}`, {
//     headers: {
//       'Cache-Control': 'no-cache',
//     },
//   })
  
//   if (!response.ok) {
//     throw new Error(`Failed to fetch tasks: ${response.status}`)
//   }
  
//   const data = await response.json()
//   return {
//     tasks: data.tasks || [],
//     total: data.total || 0
//   }
// }

// const createTask = async (taskData: CreateTaskData): Promise<Task> => {
//   const response = await fetch('/api/tasks', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(taskData),
//   })
  
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to create task')
//   }
  
//   const data = await response.json()
//   return data.task
// }

// const updateTask = async ({ id, data }: { id: string, data: Partial<CreateTaskData> }): Promise<Task> => {
//   const response = await fetch(`/api/tasks/${id}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   })
  
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to update task')
//   }
  
//   const result = await response.json()
//   return result.task
// }

// const deleteTask = async (id: string): Promise<void> => {
//   const response = await fetch(`/api/tasks/${id}`, {
//     method: 'DELETE',
//   })
  
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to delete task')
//   }
// }

// // 🚀 PERFORMANCE: Optimized query hook with smart caching
// export function useTasks(filters: TaskFilters = {}, options = {}) {
//   return useQuery({
//     queryKey: ['tasks', filters],
//     queryFn: () => fetchTasks(filters),
//     staleTime: 30 * 1000, // 30 seconds
//     refetchOnWindowFocus: false,
//     refetchOnMount: true,
//     retry: 2,
//     ...options,
//   })
// }

// export function useCreateTask() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: createTask,
//     onSuccess: (newTask) => {
//       // 🚀 PERFORMANCE: Optimistic updates
//       queryClient.setQueryData(['tasks', {}], (old: any) => {
//         if (!old) return { tasks: [newTask], total: 1 }
//         return {
//           tasks: [newTask, ...old.tasks],
//           total: old.total + 1
//         }
//       })
      
//       // Invalidate all task queries to ensure consistency
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
//       toast.success('Task created successfully!')
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || 'Failed to create task')
//     },
//   })
// }

// export function useUpdateTask() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: updateTask,
//     onSuccess: (updatedTask) => {
//       // 🚀 PERFORMANCE: Update specific task in cache
//       queryClient.setQueryData(['tasks', {}], (old: any) => {
//         if (!old) return old
//         return {
//           ...old,
//           tasks: old.tasks.map((task: Task) => 
//             task.id === updatedTask.id ? updatedTask : task
//           )
//         }
//       })
      
//       // Invalidate queries to ensure all views are updated
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
//       toast.success('Task updated successfully!')
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || 'Failed to update task')
//     },
//   })
// }

// export function useDeleteTask() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: deleteTask,
//     onSuccess: (_, deletedId) => {
//       // 🚀 PERFORMANCE: Remove task from cache
//       queryClient.setQueryData(['tasks', {}], (old: any) => {
//         if (!old) return old
//         return {
//           tasks: old.tasks.filter((task: Task) => task.id !== deletedId),
//           total: old.total - 1
//         }
//       })
      
//       // Invalidate queries to ensure all views are updated
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
//       toast.success('Task deleted successfully!')
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || 'Failed to delete task')
//     },
//   })
// }

// // 🚀 PERFORMANCE: Batch operations for multiple tasks
// export function useBatchUpdateTasks() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: async (updates: Array<{ id: string, data: Partial<CreateTaskData> }>) => {
//       const promises = updates.map(update => updateTask(update))
//       return Promise.all(promises)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//       toast.success('Tasks updated successfully!')
//     },
//     onError: (error: Error) => {
//       toast.error(error.message || 'Failed to update tasks')
//     },
//   })
// }





// src/hooks/use-tasks-optimized.ts - MAXIMUM PERFORMANCE VERSION
'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useMemo, useCallback } from 'react'

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
  limit?: number
  page?: number
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

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
}

export interface BulkTaskUpdate {
  taskIds: string[]
  data: Partial<CreateTaskData>
}

// ✅ SUPER OPTIMIZED: Enhanced fetch function with smart caching and pagination
const fetchTasks = async (filters: TaskFilters = {}): Promise<{ tasks: Task[], total: number, hasMore: boolean }> => {
  const params = new URLSearchParams()
  
  // ✅ Add pagination by default
  params.append('page', (filters.page || 1).toString())
  params.append('limit', (filters.limit || 20).toString())
  
  // Only add non-empty filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all' && key !== 'page' && key !== 'limit') {
      params.append(key, value)
    }
  })

  const response = await fetch(`/api/tasks?${params.toString()}`, {
    headers: {
      'Cache-Control': 'public, max-age=120', // ✅ 2 minute browser cache instead of no-cache
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`)
  }
  
  const data = await response.json()
  return {
    tasks: data.tasks || [],
    total: data.total || 0,
    hasMore: data.hasMore || false
  }
}

// ✅ SUPER OPTIMIZED: Infinite query fetch for large datasets
const fetchTasksInfinite = async ({ pageParam = 1, queryKey }: any) => {
  const [, filters] = queryKey
  const response = await fetchTasks({ ...filters, page: pageParam })
  return {
    ...response,
    nextPage: response.hasMore ? pageParam + 1 : undefined
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

// ✅ NEW: Bulk operations API functions
const bulkUpdateTasks = async (updates: BulkTaskUpdate): Promise<Task[]> => {
  const response = await fetch('/api/tasks/bulk-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to bulk update tasks')
  }
  
  const result = await response.json()
  return result.tasks
}

const bulkDeleteTasks = async (taskIds: string[]): Promise<void> => {
  const response = await fetch('/api/tasks/bulk-delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ taskIds }),
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to bulk delete tasks')
  }
}

// ✅ SUPER OPTIMIZED: Main query hook with maximum performance
export function useTasks(filters: TaskFilters = {}, options = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes instead of 30 seconds - MAJOR PERFORMANCE BOOST
    gcTime: 10 * 60 * 1000, // ✅ 10 minutes cache time
    refetchOnWindowFocus: false, // ✅ Keep this - good setting
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Reduce retries from 2 to 1 - faster error handling
    select: useCallback((data: any) => {
      // ✅ Memoize expensive data transformations
      return {
        tasks: data.tasks,
        total: data.total,
        hasMore: data.hasMore,
        // ✅ Pre-computed stats for dashboard
        stats: {
          todo: data.tasks.filter((t: Task) => t.status === 'TODO').length,
          inProgress: data.tasks.filter((t: Task) => t.status === 'IN_PROGRESS').length,
          completed: data.tasks.filter((t: Task) => t.status === 'COMPLETED').length,
          overdue: data.tasks.filter((t: Task) => 
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
          ).length
        }
      }
    }, []),
    ...options,
  })
}

// ✅ NEW: Infinite scroll hook for large task lists
export function useTasksInfinite(filters: TaskFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['tasks', 'infinite', filters],
    queryFn: fetchTasksInfinite,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 3 * 60 * 1000, // ✅ 3 minutes for infinite scroll
    refetchOnWindowFocus: false,
    retry: 1,
    select: useCallback((data: any) => {
      // ✅ Flatten pages and add computed properties
      const allTasks = data.pages.flatMap((page: any) => page.tasks)
      return {
        tasks: allTasks,
        total: data.pages[0]?.total || 0,
        hasNextPage: data.hasNextPage,
        isFetchingNextPage: data.isFetchingNextPage
      }
    }, [])
  })
}

// ✅ SUPER OPTIMIZED: Single task hook with smart caching
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${id}`, {
        headers: {
          'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache
        },
      })
      if (!response.ok) throw new Error('Failed to fetch task')
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ SUPER OPTIMIZED: Create task with optimistic updates and smart invalidation
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onMutate: async (newTask) => {
      // ✅ Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      // ✅ Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks', {}])

      // ✅ Optimistically update to the new value
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return { tasks: [newTask], total: 1 }
        return {
          tasks: [{ ...newTask, id: 'temp-' + Date.now(), createdAt: new Date().toISOString() }, ...old.tasks],
          total: old.total + 1
        }
      })

      // ✅ Return a context object with the snapshotted value
      return { previousTasks }
    },
    onSuccess: (newTask, _, context) => {
      // ✅ Replace optimistic update with real data
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return { tasks: [newTask], total: 1 }
        return {
          tasks: old.tasks.map((task: Task) => 
            task.id.startsWith('temp-') ? newTask : task
          ),
          total: old.total
        }
      })
      
      // ✅ Add to individual task cache
      queryClient.setQueryData(['task', newTask.id], { task: newTask })
      
      // ✅ More targeted invalidation - only refresh related data
      queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'none' })
      
      toast.success('Task created successfully! 🎯', {
        description: `"${newTask.title || newTask.name}" is ready to go.`,
      })
    },
    onError: (error: Error, _, context) => {
      // ✅ If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', {}], context.previousTasks)
      }
      
      toast.error('Failed to create task', {
        description: error.message,
      })
    },
    onSettled: () => {
      // ✅ Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ✅ SUPER OPTIMIZED: Update task with optimistic updates
export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTask,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      await queryClient.cancelQueries({ queryKey: ['task', id] })

      const previousTasks = queryClient.getQueryData(['tasks', {}])
      const previousTask = queryClient.getQueryData(['task', id])

      // ✅ Optimistically update tasks list
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task
          )
        }
      })

      // ✅ Optimistically update individual task
      queryClient.setQueryData(['task', id], (old: any) => {
        if (!old) return old
        return { task: { ...old.task, ...data, updatedAt: new Date().toISOString() } }
      })

      return { previousTasks, previousTask }
    },
    onSuccess: (updatedTask) => {
      // ✅ Update with real server data
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          )
        }
      })
      
      queryClient.setQueryData(['task', updatedTask.id], { task: updatedTask })
      
      toast.success('Task updated successfully! ✅', {
        description: `"${updatedTask.title || updatedTask.name}" has been updated.`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // ✅ Rollback optimistic updates
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', {}], context.previousTasks)
      }
      if (context?.previousTask) {
        queryClient.setQueryData(['task', id], context.previousTask)
      }
      
      toast.error('Failed to update task', {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ✅ SUPER OPTIMIZED: Delete task with optimistic updates
export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData(['tasks', {}])

      // ✅ Optimistically remove task
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          tasks: old.tasks.filter((task: Task) => task.id !== deletedId),
          total: old.total - 1
        }
      })

      return { previousTasks }
    },
    onSuccess: (_, deletedId) => {
      // ✅ Remove from individual cache
      queryClient.removeQueries({ queryKey: ['task', deletedId] })
      
      toast.success('Task deleted successfully! 🗑️', {
        description: 'The task has been removed.',
      })
    },
    onError: (error: Error, _, context) => {
      // ✅ Rollback optimistic update
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', {}], context.previousTasks)
      }
      
      toast.error('Failed to delete task', {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ✅ SUPER OPTIMIZED: Bulk operations with progress tracking
export function useBulkUpdateTasks() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bulkUpdateTasks,
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks', {}])

      // ✅ Optimistically update all affected tasks
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            updates.taskIds.includes(task.id) 
              ? { ...task, ...updates.data, updatedAt: new Date().toISOString() }
              : task
          )
        }
      })

      return { previousTasks }
    },
    onSuccess: (updatedTasks, updates) => {
      // ✅ Update with real server data
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => {
            const updatedTask = updatedTasks.find(ut => ut.id === task.id)
            return updatedTask || task
          })
        }
      })
      
      toast.success(`${updates.taskIds.length} tasks updated successfully! ✅`)
    },
    onError: (error: Error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', {}], context.previousTasks)
      }
      
      toast.error('Failed to bulk update tasks', {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ✅ NEW: Bulk delete with optimistic updates
export function useBulkDeleteTasks() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: bulkDeleteTasks,
    onMutate: async (taskIds) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks', {}])

      // ✅ Optimistically remove tasks
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          tasks: old.tasks.filter((task: Task) => !taskIds.includes(task.id)),
          total: old.total - taskIds.length
        }
      })

      return { previousTasks }
    },
    onSuccess: (_, deletedIds) => {
      // ✅ Remove from individual caches
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['task', id] })
      })
      
      toast.success(`${deletedIds.length} tasks deleted successfully! 🗑️`)
    },
    onError: (error: Error, _, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', {}], context.previousTasks)
      }
      
      toast.error('Failed to bulk delete tasks', {
        description: error.message,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// ✅ NEW: Task statistics hook
export function useTaskStats() {
  return useQuery({
    queryKey: ['tasks', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/tasks/stats', {
        headers: {
          'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache
        },
      })
      if (!response.ok) throw new Error('Failed to fetch task statistics')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ Export all types
export type { TaskFilters, CreateTaskData, UpdateTaskData, BulkTaskUpdate }