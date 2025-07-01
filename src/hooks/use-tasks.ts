// // src/hooks/use-tasks.ts
// 'use client'

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'

// // Types
// interface Task {
//   id: string
//   name: string
//   date?: string
//   module?: string
//   devDept?: string
//   taskType?: string
//   subTask?: string
//   modify?: string
//   reference?: string
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
//     department?: string
//   }
//   assignee?: {
//     id: string
//     name: string
//     email: string
//     department?: string
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

// interface TaskFilters {
//   status?: string
//   priority?: string
//   projectId?: string
//   search?: string
//   module?: string
//   taskType?: string
//   devDept?: string
// }

// interface CreateTaskData {
//   name: string
//   date?: string
//   module?: string
//   devDept?: string
//   taskType?: string
//   subTask?: string
//   modify?: string
//   reference?: string
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

// interface UpdateTaskData {
//   name?: string
//   date?: string
//   module?: string
//   devDept?: string
//   taskType?: string
//   subTask?: string
//   modify?: string
//   reference?: string
//   trackingNo?: string
//   status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
//   solveDate?: string
//   sentBy?: string
//   comments?: string
//   priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   dueDate?: string
//   assigneeId?: string
//   projectId?: string
// }

// // API Functions
// const fetchTasks = async (filters: TaskFilters = {}): Promise<{ tasks: Task[] }> => {
//   const params = new URLSearchParams()
  
//   if (filters.status) params.append('status', filters.status)
//   if (filters.priority) params.append('priority', filters.priority)
//   if (filters.projectId) params.append('projectId', filters.projectId)
//   if (filters.search) params.append('search', filters.search)
//   if (filters.module) params.append('module', filters.module)
//   if (filters.taskType) params.append('taskType', filters.taskType)
//   if (filters.devDept) params.append('devDept', filters.devDept)

//   const response = await fetch(`/api/tasks?${params.toString()}`)
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch tasks')
//   }
  
//   return response.json()
// }

// const fetchTask = async (id: string): Promise<{ task: Task }> => {
//   const response = await fetch(`/api/tasks/${id}`)
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch task')
//   }
  
//   return response.json()
// }

// const createTask = async (data: CreateTaskData): Promise<{ task: Task }> => {
//   const response = await fetch('/api/tasks', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   })
  
//   if (!response.ok) {
//     const error = await response.json()
//     throw new Error(error.error || 'Failed to create task')
//   }
  
//   return response.json()
// }

// const updateTask = async ({ id, data }: { id: string; data: UpdateTaskData }): Promise<{ task: Task }> => {
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
  
//   return response.json()
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

// // Custom Hooks
// export function useTasks(filters: TaskFilters = {}) {
//   return useQuery({
//     queryKey: ['tasks', filters],
//     queryFn: () => fetchTasks(filters),
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   })
// }

// export function useTask(id: string) {
//   return useQuery({
//     queryKey: ['task', id],
//     queryFn: () => fetchTask(id),
//     enabled: !!id,
//   })
// }

// export function useCreateTask() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: createTask,
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//       toast.success('Task created successfully! 📝', {
//         description: `"${data.task.name}" has been added to your tasks.`,
//       })
//     },
//     onError: (error: Error) => {
//       toast.error('Failed to create task', {
//         description: error.message,
//       })
//     },
//   })
// }

// export function useUpdateTask() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: updateTask,
//     onMutate: async (variables) => {
//       // Cancel any outgoing refetches
//       await queryClient.cancelQueries({ queryKey: ['tasks'] })
      
//       // Snapshot the previous value
//       const previousTasks = queryClient.getQueryData(['tasks'])
      
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
      
//       return { previousTasks }
//     },
//     onError: (err, variables, context) => {
//       // Rollback on error
//       if (context?.previousTasks) {
//         queryClient.setQueryData(['tasks'], context.previousTasks)
//       }
//       toast.error('Failed to update task', {
//         description: err.message,
//       })
//     },
//     onSuccess: (data, variables) => {
//       // Update the cache with server response
//       queryClient.setQueryData(['tasks'], (old: any) => {
//         if (!old?.tasks) return old
        
//         const updatedTasks = old.tasks.map((task: any) =>
//           task.id === variables.id ? data.task : task
//         )
//         return { ...old, tasks: updatedTasks }
//       })
      
//       toast.success('Task updated successfully! ✅', {
//         description: `Status changed to ${data.task.status.replace('_', ' ')}`,
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
  
//   return useMutation({
//     mutationFn: deleteTask,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] })
//       toast.success('Task deleted successfully! 🗑️', {
//         description: 'The task has been removed from your list.',
//       })
//     },
//     onError: (error: Error) => {
//       toast.error('Failed to delete task', {
//         description: error.message,
//       })
//     },
//   })
// }

// // Export types
// export type { Task, TaskFilters, CreateTaskData, UpdateTaskData }




// src/hooks/use-tasks.ts - UPDATED WITH REAL-TIME NOTIFICATIONS
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { NotificationEvents } from '@/lib/notifications'

// Types that match your Prisma schema
interface Task {
  id: string
  title: string
  name?: string
  description?: string
  date?: string
  
  // Foreign key IDs
  moduleId?: string
  devDeptId?: string
  taskTypeId?: string
  subTaskId?: string
  modifyId?: string
  referenceId?: string
  
  // Relations (populated by includes)
  module?: { id: string; name: string }
  devDept?: { id: string; name: string }
  taskType?: { id: string; name: string }
  subTask?: { id: string; name: string }
  modify?: { id: string; name: string }
  reference?: { id: string; name: string }
  
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
    image?: string
  }
  assignee?: {
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
  moduleId?: string
  devDeptId?: string
  taskTypeId?: string
}

interface CreateTaskData {
  title: string
  name?: string
  description?: string
  date?: string
  
  // Send foreign key IDs directly
  moduleId?: string
  devDeptId?: string
  taskTypeId?: string
  subTaskId?: string
  modifyId?: string
  referenceId?: string
  
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
  title?: string
  name?: string
  description?: string
  date?: string
  moduleId?: string
  devDeptId?: string
  taskTypeId?: string
  subTaskId?: string
  modifyId?: string
  referenceId?: string
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
  if (filters.moduleId) params.append('moduleId', filters.moduleId)
  if (filters.devDeptId) params.append('devDeptId', filters.devDeptId)
  if (filters.taskTypeId) params.append('taskTypeId', filters.taskTypeId)

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
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTask,
    onSuccess: (data) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      // ✅ TRIGGER REAL-TIME NOTIFICATION
      NotificationEvents.taskCreated(
        data.task.id,
        data.task.title || data.task.name || 'New Task',
        data.task.creator.id
      )
      
      toast.success('Task created successfully! 📝', {
        description: `"${data.task.title || data.task.name}" has been added to your tasks.`,
      })
    },
    onError: (error: Error) => {
      console.error('Create task error:', error)
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
      
      // Get current task for comparison
      const currentTask = queryClient.getQueryData(['task', variables.id]) as { task: Task } | undefined
      
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
      
      return { previousTasks, currentTask }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      console.error('Update task error:', err)
      toast.error('Failed to update task', {
        description: err.message,
      })
    },
    onSuccess: (data, variables, context) => {
      // Update the cache with server response
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old?.tasks) return old
        
        const updatedTasks = old.tasks.map((task: any) =>
          task.id === variables.id ? data.task : task
        )
        return { ...old, tasks: updatedTasks }
      })
      
      // Update individual task cache if it exists
      queryClient.setQueryData(['task', variables.id], { task: data.task })
      
      // ✅ TRIGGER REAL-TIME NOTIFICATION FOR STATUS CHANGES
      const oldTask = context?.currentTask?.task
      if (oldTask && variables.data.status && oldTask.status !== variables.data.status) {
        NotificationEvents.taskStatusChanged(
          data.task.id,
          data.task.title || data.task.name || 'Task',
          oldTask.status,
          variables.data.status,
          data.task.creator.id
        )
      } else if (variables.data && Object.keys(variables.data).length > 0) {
        // General task update notification
        NotificationEvents.taskUpdated(
          data.task.id,
          data.task.title || data.task.name || 'Task',
          variables.data,
          data.task.creator.id
        )
      }
      
      // Determine success message based on what was updated
      let successMessage = 'Task updated successfully! ✅'
      let description = 'Changes have been saved.'
      
      if (variables.data.status) {
        successMessage = 'Task status updated! 🔄'
        description = `Status changed to ${variables.data.status.replace('_', ' ')}`
      } else if (variables.data.priority) {
        successMessage = 'Task priority updated! ⚡'
        description = `Priority set to ${variables.data.priority}`
      }
      
      toast.success(successMessage, { description })
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
    onMutate: async (taskId) => {
      // Get task info before deletion for notification
      const taskData = queryClient.getQueryData(['task', taskId]) as { task: Task } | undefined
      const tasksData = queryClient.getQueryData(['tasks']) as { tasks: Task[] } | undefined
      
      let taskToDelete = taskData?.task
      if (!taskToDelete && tasksData?.tasks) {
        taskToDelete = tasksData.tasks.find(t => t.id === taskId)
      }
      
      return { taskToDelete }
    },
    onSuccess: (_, taskId, context) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      // ✅ TRIGGER REAL-TIME NOTIFICATION
      if (context?.taskToDelete) {
        NotificationEvents.taskDeleted(
          taskId,
          context.taskToDelete.title || context.taskToDelete.name || 'Task',
          context.taskToDelete.creator.id
        )
      }
      
      toast.success('Task deleted successfully! 🗑️', {
        description: 'The task has been removed from your list.',
      })
    },
    onError: (error: Error) => {
      console.error('Delete task error:', error)
      toast.error('Failed to delete task', {
        description: error.message,
      })
    },
  })
}

// Export types
export type { Task, TaskFilters, CreateTaskData, UpdateTaskData }