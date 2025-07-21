

// // src/hooks/use-tasks.ts - COMPLETE REPLACEMENT FILE
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
//   trackingNo?: string
//   sentBy?: string
//   solveDate?: string
  
//   // Foreign key IDs
//   moduleId?: string
//   devDeptId?: string
//   taskTypeId?: string
//   subTaskId?: string
//   modifyId?: string
//   referenceId?: string
//   assigneeId?: string
//   projectId?: string
  
//   // Relations
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
//   devDept?: {
//     id: string
//     name: string
//   }
//   taskType?: {
//     id: string
//     name: string
//   }
//   subTask?: {
//     id: string
//     name: string
//   }
//   modify?: {
//     id: string
//     name: string
//   }
//   reference?: {
//     id: string
//     name: string
//   }
//   tags?: Array<{
//     tag: {
//       id: string
//       name: string
//       color: string
//     }
//   }>
//   _count?: {
//     comments: number
//   }
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

// export interface UpdateTaskData extends Partial<CreateTaskData> {}

// // API Functions
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

// const updateTask = async ({ id, data }: { id: string, data: UpdateTaskData }): Promise<Task> => {
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

// // Hooks
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
//       // Optimistic updates
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
//       // Update specific task in cache
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
//       // Remove task from cache
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

// // Get single task
// export function useTask(id: string) {
//   return useQuery({
//     queryKey: ['task', id],
//     queryFn: async () => {
//       const response = await fetch(`/api/tasks/${id}`)
//       if (!response.ok) throw new Error('Failed to fetch task')
//       return response.json()
//     },
//     enabled: !!id,
//     staleTime: 1000 * 60 * 5,
//   })
// }

// // Export types
// export type { TaskFilters, CreateTaskData, UpdateTaskData }






// src/hooks/use-tasks.ts - OPTIMIZED FOR PERFORMANCE
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
  trackingNo?: string
  sentBy?: string
  solveDate?: string
  
  // Foreign key IDs
  moduleId?: string
  devDeptId?: string
  taskTypeId?: string
  subTaskId?: string
  modifyId?: string
  referenceId?: string
  assigneeId?: string
  projectId?: string
  
  // Relations
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
  devDept?: {
    id: string
    name: string
  }
  taskType?: {
    id: string
    name: string
  }
  subTask?: {
    id: string
    name: string
  }
  modify?: {
    id: string
    name: string
  }
  reference?: {
    id: string
    name: string
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

export interface UpdateTaskData extends Partial<CreateTaskData> {}

// ✅ OPTIMIZED API Functions
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
      'Cache-Control': 'public, max-age=300', // ✅ 5 minute browser cache instead of no-cache
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

const updateTask = async ({ id, data }: { id: string, data: UpdateTaskData }): Promise<Task> => {
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

// ✅ OPTIMIZED Hooks - MAIN PERFORMANCE FIXES HERE
export function useTasks(filters: TaskFilters = {}, options = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes instead of 30 seconds - MAJOR PERFORMANCE BOOST
    gcTime: 10 * 60 * 1000, // ✅ 10 minutes cache time
    refetchOnWindowFocus: false, // ✅ Keep this - good setting
    refetchOnMount: false, // ✅ Use cache first instead of always refetching - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Reduce retries from 2 to 1 - faster error handling
    ...options,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // ✅ Optimistic updates - keep your existing functionality
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return { tasks: [newTask], total: 1 }
        return {
          tasks: [newTask, ...old.tasks],
          total: old.total + 1
        }
      })
      
      // ✅ More targeted invalidation - only invalidate tasks, not everything
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
      // ✅ Update specific task in cache - keep your existing functionality
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => 
            task.id === updatedTask.id ? updatedTask : task
          )
        }
      })
      
      // ✅ More targeted invalidation
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
      // ✅ Remove task from cache - keep your existing functionality
      queryClient.setQueryData(['tasks', {}], (old: any) => {
        if (!old) return old
        return {
          tasks: old.tasks.filter((task: Task) => task.id !== deletedId),
          total: old.total - 1
        }
      })
      
      // ✅ More targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Task deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete task')
    },
  })
}

// ✅ OPTIMIZED Get single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${id}`)
      if (!response.ok) throw new Error('Failed to fetch task')
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes instead of 5 minutes (keep consistency)
    refetchOnWindowFocus: false, // ✅ Prevent unnecessary refetches
  })
}

// Export types
export type { TaskFilters, CreateTaskData, UpdateTaskData }