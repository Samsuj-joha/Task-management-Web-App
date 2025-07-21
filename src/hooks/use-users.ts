

// // src/hooks/use-users.ts - NEW FILE
// 'use client'

// import { useQuery } from '@tanstack/react-query'

// export interface User {
//   id: string
//   name: string
//   email: string
//   image?: string
//   role: string
//   department?: string
//   status: string
//   initials: string
// }

// interface UsersResponse {
//   users: User[]
//   total: number
// }

// // Fetch users function
// async function fetchUsers(): Promise<UsersResponse> {
//   const response = await fetch('/api/users', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })

//   if (!response.ok) {
//     throw new Error(`Failed to fetch users: ${response.statusText}`)
//   }

//   return response.json()
// }

// // Main hook
// export function useUsers() {
//   return useQuery({
//     queryKey: ['users'],
//     queryFn: fetchUsers,
//     staleTime: 5 * 60 * 1000, // 5 minutes - users don't change often
//     refetchOnWindowFocus: false,
//     retry: 2,
//   })
// }




// src/hooks/use-users.ts - OPTIMIZED FOR MAXIMUM PERFORMANCE
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: string
  department?: string
  status: string
  initials: string
}

export interface UserFilters {
  search?: string
  role?: string
  department?: string
  status?: string
}

interface UsersResponse {
  users: User[]
  total: number
}

interface CreateUserData {
  name: string
  email: string
  role: string
  department?: string
  status?: string
}

interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  department?: string
  status?: string
}

// ✅ OPTIMIZED Fetch users function
async function fetchUsers(filters: UserFilters = {}): Promise<UsersResponse> {
  const params = new URLSearchParams()
  
  // Add filters to query params
  if (filters.search) params.append('search', filters.search)
  if (filters.role) params.append('role', filters.role)
  if (filters.department) params.append('department', filters.department)
  if (filters.status) params.append('status', filters.status)

  const response = await fetch(`/api/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600', // ✅ 10 minute browser cache - users change rarely
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }

  return response.json()
}

// ✅ OPTIMIZED Fetch single user function
async function fetchUser(id: string): Promise<{ user: User }> {
  const response = await fetch(`/api/users/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600', // ✅ 10 minute browser cache
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`)
  }

  return response.json()
}

// ✅ OPTIMIZED Create user function
async function createUser(userData: CreateUserData): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create user')
  }

  const result = await response.json()
  return result.user || result
}

// ✅ OPTIMIZED Update user function
async function updateUser({ id, data }: { id: string; data: UpdateUserData }): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update user')
  }

  const result = await response.json()
  return result.user || result
}

// ✅ OPTIMIZED Delete user function
async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete user')
  }
}

// ✅ ENHANCED Main hook with filters support
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 15 * 60 * 1000, // ✅ Increased to 15 minutes - users rarely change
    gcTime: 20 * 60 * 1000, // ✅ 20 minutes cache time
    refetchOnWindowFocus: false, // ✅ Already good
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Reduced from 2 to 1 for faster error handling
    onError: (error: Error) => {
      console.error('Users fetch error:', error)
      toast.error('Failed to load users')
    },
  })
}

// ✅ NEW Single user hook
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', 'single', id],
    queryFn: () => fetchUser(id),
    enabled: !!id, // ✅ Only fetch when ID exists
    staleTime: 15 * 60 * 1000, // ✅ 15 minutes - individual users change rarely
    gcTime: 20 * 60 * 1000, // ✅ 20 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error: Error) => {
      console.error('User fetch error:', error)
      toast.error('Failed to load user')
    },
  })
}

// ✅ NEW Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      // ✅ Optimistic cache update - instant UI update
      queryClient.setQueryData(['users', {}], (old: any) => {
        if (!old) return { users: [newUser], total: 1 }
        return {
          users: [newUser, ...old.users],
          total: old.total + 1
        }
      })
      
      // ✅ Add to individual user cache
      queryClient.setQueryData(['users', 'single', newUser.id], { user: newUser })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      toast.success('User created successfully! 👤', {
        description: `${newUser.name} has been added to the system.`,
      })
    },
    onError: (error: Error) => {
      console.error('Create user error:', error)
      toast.error('Failed to create user', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // ✅ Update users list cache
      queryClient.setQueryData(['users', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          users: old.users?.map((user: User) => 
            user.id === updatedUser.id ? updatedUser : user
          ) || []
        }
      })
      
      // ✅ Update individual user cache
      queryClient.setQueryData(['users', 'single', updatedUser.id], { user: updatedUser })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      toast.success('User updated successfully! ✅', {
        description: `${updatedUser.name} has been updated.`,
      })
    },
    onError: (error: Error) => {
      console.error('Update user error:', error)
      toast.error('Failed to update user', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedId) => {
      // ✅ Remove from users list cache
      queryClient.setQueryData(['users', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          users: old.users?.filter((user: User) => user.id !== deletedId) || [],
          total: Math.max((old.total || 1) - 1, 0)
        }
      })
      
      // ✅ Remove from individual user cache
      queryClient.removeQueries({ queryKey: ['users', 'single', deletedId] })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['users'] })
      
      toast.success('User deleted successfully! 🗑️', {
        description: 'The user has been removed from the system.',
      })
    },
    onError: (error: Error) => {
      console.error('Delete user error:', error)
      toast.error('Failed to delete user', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW User statistics hook
export function useUserStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/users/stats', {
        headers: {
          'Cache-Control': 'public, max-age=900', // ✅ 15 minute cache for stats
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user statistics')
      }
      
      return response.json()
    },
    staleTime: 20 * 60 * 1000, // ✅ 20 minutes - stats change very rarely
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ Export types for convenience
export type { UserFilters, UsersResponse, CreateUserData, UpdateUserData }