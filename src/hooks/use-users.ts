// src/hooks/use-users.ts
'use client'

import { useQuery } from '@tanstack/react-query'

export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  firstName?: string
  lastName?: string
  department?: string
  isActive: boolean
}

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users')
  
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  
  const data = await response.json()
  return data.users || []
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}