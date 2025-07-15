// lib/permissions.ts - CREATE THIS FILE
export type UserRole = 'ADMIN' | 'USER'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
}

export interface Task {
  id: string
  creatorId: string
  assigneeId?: string
}

// Simple permission checks
export const permissions = {
  // Only Admin can see all tasks
  canViewAllTasks: (user: User) => user.role === 'ADMIN',
  
  // Admin can edit any task, Users can edit own tasks
  canEditTask: (user: User, task: Task) => {
    if (user.role === 'ADMIN') return true
    return task.creatorId === user.id || task.assigneeId === user.id
  },
  
  // Admin can delete any task, Users can delete only created tasks
  canDeleteTask: (user: User, task: Task) => {
    if (user.role === 'ADMIN') return true
    return task.creatorId === user.id
  },
  
  // Only admin can manage users
  canManageUsers: (user: User) => user.role === 'ADMIN'
}

// Helper to get tasks query based on user role
export const getTasksQuery = (user: User) => {
  if (user.role === 'ADMIN') {
    console.log('🔑 ADMIN: Returning empty where clause (sees all tasks)')
    return {} // Admin sees all tasks
  } else {
    console.log('👤 USER: Filtering to own tasks only')
    return {
      OR: [
        { creatorId: user.id },
        { assigneeId: user.id }
      ]
    }
  }
}