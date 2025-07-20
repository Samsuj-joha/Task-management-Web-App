// // src/hooks/use-users.ts
// 'use client'

// import { useQuery } from '@tanstack/react-query'

// export interface User {
//   id: string
//   name: string
//   email: string
//   image?: string
//   role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
//   firstName?: string
//   lastName?: string
//   department?: string
//   isActive: boolean
// }

// const fetchUsers = async (): Promise<User[]> => {
//   const response = await fetch('/api/users')
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch users')
//   }
  
//   const data = await response.json()
//   return data.users || []
// }

// export function useUsers() {
//   return useQuery({
//     queryKey: ['users'],
//     queryFn: fetchUsers,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     retry: 3,
//   })
// }



// src/hooks/use-users.ts - NEW FILE
'use client'

import { useQuery } from '@tanstack/react-query'

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

interface UsersResponse {
  users: User[]
  total: number
}

// Fetch users function
async function fetchUsers(): Promise<UsersResponse> {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }

  return response.json()
}

// Main hook
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes - users don't change often
    refetchOnWindowFocus: false,
    retry: 2,
  })
}