

// // src/hooks/use-tasks.ts - Updated with Socket.IO Integration
// 'use client'

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'
// import { useSocket } from './use-socket'

// // [Previous Task interfaces remain the same...]
// interface Task {
//   id: string
//   title: string
//   name?: string
//   description?: string
//   date?: string
//   moduleId?: string
//   devDeptId?: string
//   taskTypeId?: string
//   subTaskId?: string
//   modifyId?: string
//   referenceId?: string
//   module?: { id: string; name: string }
//   devDept?: { id: string; name: string }
//   taskType?: { id: string; name: string }
//   subTask?: { id: string; name: string }
//   modify?: { id: string; name: string }
//   reference?: { id: string; name: string }
//   trackingNo?: string
//   status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
//   solveDate?: string
//   sentBy?: string
//   comments?: string
//   priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   dueDate?: string
//   createdAt: string
//   updatedAt: string
//   completedAt?: string
//   creator: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
//   assignee?: {
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

// interface CreateTaskData {
//   title: string
//   name?: string
//   description?: string
//   date?: string
//   moduleId?: string
//   devDeptId?: string
//   taskTypeId?: string
//   subTaskId?: string
//   modifyId?: string
//   referenceId?: string
//   trackingNo?: string
//   status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
//   solveDate?: string
//   sentBy?: string
//   comments?: string
//   priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   dueDate?: string
//   assigneeId?: string
//   projectId?: string
//   tags?: string[]
// }

// interface UpdateTaskData extends Partial<CreateTaskData> {}

// // API Functions
// const createTask = async (data: CreateTaskData) => {
//   const response = await fetch('/api/tasks', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   })
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to create task')
//   }
//   return response.json()
// }

// const updateTask = async ({ id, data }: { id: string; data: UpdateTaskData }) => {
//   const response = await fetch(`/api/tasks/${id}`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
//   })
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to update task')
//   }
//   return response.json()
// }

// const deleteTask = async (id: string) => {
//   const response = await fetch(`/api/tasks/${id}`, {
//     method: 'DELETE'
//   })
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to delete task')
//   }
//   return response.json()
// }

// // Hooks with Socket.IO Integration
// export function useCreateTask() {
//   const queryClient = useQueryClient()
//   const { emitTaskCreated } = useSocket()
  
//   return useMutation({
//     mutationFn: createTask,
//     onSuccess: (data) => {
//       // Invalidate and refetch tasks
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
//       // ✅ EMIT SOCKET EVENT for real-time notification
//       emitTaskCreated({
//         id: data.task.id,
//         title: data.task.title || data.task.name,
//         name: data.task.name,
//         priority: data.task.priority,
//         status: data.task.status,
//         assigneeId: data.task.assignee?.id,
//         projectId: data.task.project?.id,
//         createdBy: data.task.creator.id
//       })
      
//       toast.success('Task created successfully! 📝', {
//         description: `"${data.task.title || data.task.name}" has been added and team notified.`,
//         duration: 5000
//       })
//     },
//     onError: (error: Error) => {
//       console.error('Create task error:', error)
//       toast.error('Failed to create task', {
//         description: error.message,
//         duration: 5000
//       })
//     },
//   })
// }

// export function useUpdateTask() {
//   const queryClient = useQueryClient()
//   const { emitTaskStatusChanged, emitTaskAssigned } = useSocket()
  
//   return useMutation({
//     mutationFn: updateTask,
//     onMutate: async (variables) => {
//       // Cancel any outgoing refetches
//       await queryClient.cancelQueries({ queryKey: ['tasks'] })
      
//       // Snapshot the previous value
//       const previousTasks = queryClient.getQueryData(['tasks'])
      
//       // Get current task for comparison
//       const currentTask = queryClient.getQueryData(['task', variables.id]) as { task: Task } | undefined
      
//       // Optimistically update the cache
//       queryClient.setQueryData(['tasks'], (old: any) => {
//         if (!old?.tasks) return old
        
//         const updatedTasks = old.tasks.map((task: any) =>
//           task.id === variables.id 
//             ? { ...task, ...variables.data, updatedAt: new Date().toISOString() }
//             : task
//         )
//         return { ...old, tasks: updatedTasks }
//       })
      
//       return { previousTasks, currentTask }
//     },
//     onError: (err, variables, context) => {
//       // Rollback on error
//       if (context?.previousTasks) {
//         queryClient.setQueryData(['tasks'], context.previousTasks)
//       }
//       console.error('Update task error:', err)
//       toast.error('Failed to update task', {
//         description: err.message,
//       })
//     },
//     onSuccess: (data, variables, context) => {
//       // Update the cache with server response
//       queryClient.setQueryData(['tasks'], (old: any) => {
//         if (!old?.tasks) return old
        
//         const updatedTasks = old.tasks.map((task: any) =>
//           task.id === variables.id ? data.task : task
//         )
//         return { ...old, tasks: updatedTasks }
//       })
      
//       // Update individual task cache if it exists
//       queryClient.setQueryData(['task', variables.id], { task: data.task })
      
//       // ✅ EMIT SOCKET EVENTS for real-time notifications
//       const oldTask = context?.currentTask?.task
      
//       // Status change notification
//       if (oldTask && variables.data.status && oldTask.status !== variables.data.status) {
//         emitTaskStatusChanged({
//           taskId: data.task.id,
//           taskName: data.task.title || data.task.name || 'Task',
//           oldStatus: oldTask.status,
//           newStatus: variables.data.status
//         })
//       }
      
//       // Assignment notification
//       if (variables.data.assigneeId && oldTask?.assignee?.id !== variables.data.assigneeId) {
//         emitTaskAssigned({
//           taskId: data.task.id,
//           taskName: data.task.title || data.task.name || 'Task',
//           assigneeId: variables.data.assigneeId
//         })
//       }
      
//       // Determine success message based on what was updated
//       let successMessage = 'Task updated successfully! ✅'
//       let description = 'Changes have been saved and team notified.'
      
//       if (variables.data.status) {
//         successMessage = 'Task status updated! 🔄'
//         description = `Status changed to ${variables.data.status.replace('_', ' ')} - team notified via real-time.`
//       } else if (variables.data.assigneeId) {
//         successMessage = 'Task assigned! 👤'
//         description = 'Assignee has been notified instantly.'
//       } else if (variables.data.priority) {
//         successMessage = 'Task priority updated! ⚡'
//         description = `Priority set to ${variables.data.priority}`
//       }
      
//       toast.success(successMessage, { 
//         description,
//         duration: 5000
//       })
//     },
//     onSettled: () => {
//       // Always refetch to ensure consistency
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//     },
//   })
// }

// export function useDeleteTask() {
//   const queryClient = useQueryClient()
//   const { socket } = useSocket()
  
//   return useMutation({
//     mutationFn: deleteTask,
//     onMutate: async (taskId) => {
//       // Get task info before deletion for notification
//       const taskData = queryClient.getQueryData(['task', taskId]) as { task: Task } | undefined
//       const tasksData = queryClient.getQueryData(['tasks']) as { tasks: Task[] } | undefined
      
//       let taskToDelete = taskData?.task
//       if (!taskToDelete && tasksData?.tasks) {
//         taskToDelete = tasksData.tasks.find(t => t.id === taskId)
//       }
      
//       return { taskToDelete }
//     },
//     onSuccess: (_, taskId, context) => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
//       // ✅ EMIT SOCKET EVENT for task deletion
//       if (context?.taskToDelete && socket?.connected) {
//         socket.emit('task-deleted', {
//           taskId,
//           taskName: context.taskToDelete.title || context.taskToDelete.name || 'Task',
//           deletedBy: context.taskToDelete.creator.id
//         })
//       }
      
//       toast.success('Task deleted successfully! 🗑️', {
//         description: 'The task has been removed and team notified.',
//         duration: 4000
//       })
//     },
//     onError: (error: Error) => {
//       toast.error('Failed to delete task', {
//         description: error.message,
//         duration: 5000
//       })
//     },
//   })
// }

// // Get tasks with real-time updates
// export function useTasks(filters?: any) {
//   return useQuery({
//     queryKey: ['tasks', filters],
//     queryFn: async () => {
//       const searchParams = new URLSearchParams()
      
//       if (filters?.status) searchParams.append('status', filters.status)
//       if (filters?.priority) searchParams.append('priority', filters.priority)
//       if (filters?.search) searchParams.append('search', filters.search)
//       if (filters?.projectId) searchParams.append('projectId', filters.projectId)
//       if (filters?.moduleId) searchParams.append('moduleId', filters.moduleId)
//       if (filters?.devDeptId) searchParams.append('devDeptId', filters.devDeptId)
//       if (filters?.taskTypeId) searchParams.append('taskTypeId', filters.taskTypeId)
      
//       const response = await fetch(`/api/tasks?${searchParams}`)
//       if (!response.ok) throw new Error('Failed to fetch tasks')
//       return response.json()
//     },
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     refetchOnWindowFocus: true,
//     refetchInterval: 30000, // Backup polling every 30 seconds
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
// export type { Task, CreateTaskData, UpdateTaskData }





// src/hooks/use-tasks.ts - COMPLETE REPLACEMENT FILE
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

// API Functions
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

// Hooks
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
      // Optimistic updates
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
      // Update specific task in cache
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
      // Remove task from cache
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

// Get single task
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${id}`)
      if (!response.ok) throw new Error('Failed to fetch task')
      return response.json()
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// Export types
export type { TaskFilters, CreateTaskData, UpdateTaskData }