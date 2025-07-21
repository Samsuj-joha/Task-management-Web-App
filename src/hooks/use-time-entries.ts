// // src/hooks/use-time-entries.ts
// import { useState, useEffect } from 'react'
// import { toast } from 'sonner'

// export interface TimeEntry {
//   id: string
//   description: string
//   duration: number // in minutes
//   startTime: string
//   endTime: string
//   date: string
//   category: string
//   billable: boolean
//   createdAt: string
//   updatedAt: string
//   userId: string
//   taskId?: string
//   projectId?: string
//   user: {
//     id: string
//     name: string
//     email: string
//     image?: string
//   }
//   task?: {
//     id: string
//     title: string
//     status: string
//     priority: string
//   }
//   project?: {
//     id: string
//     name: string
//     status: string
//   }
// }

// export interface TimeEntryFilters {
//   search?: string
//   filter?: 'today' | 'week' | 'month' | 'all'
//   category?: string
//   billable?: string
// }

// export interface UseTimeEntriesReturn {
//   data: {
//     timeEntries: TimeEntry[]
//     total: number
//     message: string
//   } | null
//   isLoading: boolean
//   error: string | null
//   refetch: () => Promise<void>
//   createTimeEntry: (entryData: any) => Promise<boolean>
//   updateTimeEntry: (id: string, updateData: any) => Promise<boolean>
//   deleteTimeEntry: (id: string) => Promise<boolean>
// }

// export function useTimeEntries(filters: TimeEntryFilters = {}): UseTimeEntriesReturn {
//   const [data, setData] = useState<UseTimeEntriesReturn['data']>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchTimeEntries = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       // Build query params
//       const params = new URLSearchParams()
//       if (filters.search) params.append('search', filters.search)
//       if (filters.filter) params.append('filter', filters.filter)
//       if (filters.category) params.append('category', filters.category)
//       if (filters.billable) params.append('billable', filters.billable)

//       const response = await fetch(`/api/time-entries?${params.toString()}`)
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch time entries: ${response.status}`)
//       }

//       const result = await response.json()
//       setData(result)
//     } catch (err) {
//       console.error('Time entries fetch error:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load time entries')
//       toast.error('Failed to load time entries')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const createTimeEntry = async (entryData: any): Promise<boolean> => {
//     try {
//       const response = await fetch('/api/time-entries', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(entryData),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to create time entry')
//       }

//       const result = await response.json()
//       toast.success('Time entry created successfully!')
      
//       // Refresh time entries list
//       await fetchTimeEntries()
//       return true
//     } catch (err) {
//       console.error('Create time entry error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to create time entry')
//       return false
//     }
//   }

//   const updateTimeEntry = async (id: string, updateData: any): Promise<boolean> => {
//     try {
//       const response = await fetch(`/api/time-entries/${id}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ data: updateData }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to update time entry')
//       }

//       toast.success('Time entry updated successfully!')
      
//       // Refresh time entries list
//       await fetchTimeEntries()
//       return true
//     } catch (err) {
//       console.error('Update time entry error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to update time entry')
//       return false
//     }
//   }

//   const deleteTimeEntry = async (id: string): Promise<boolean> => {
//     try {
//       const response = await fetch(`/api/time-entries/${id}`, {
//         method: 'DELETE',
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to delete time entry')
//       }

//       toast.success('Time entry deleted successfully!')
      
//       // Refresh time entries list
//       await fetchTimeEntries()
//       return true
//     } catch (err) {
//       console.error('Delete time entry error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to delete time entry')
//       return false
//     }
//   }

//   const refetch = fetchTimeEntries

//   useEffect(() => {
//     fetchTimeEntries()
//   }, [filters.search, filters.filter, filters.category, filters.billable])

//   return {
//     data,
//     isLoading,
//     error,
//     refetch,
//     createTimeEntry,
//     updateTimeEntry,
//     deleteTimeEntry,
//   }
// }

// // Hook for getting a single time entry
// export function useTimeEntry(id: string) {
//   const [data, setData] = useState<{ timeEntry: TimeEntry } | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchTimeEntry = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       const response = await fetch(`/api/time-entries/${id}`)
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch time entry: ${response.status}`)
//       }

//       const result = await response.json()
//       setData(result)
//     } catch (err) {
//       console.error('Time entry fetch error:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load time entry')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (id) {
//       fetchTimeEntry()
//     }
//   }, [id])

//   return {
//     data,
//     isLoading,
//     error,
//     refetch: fetchTimeEntry,
//   }
// }

// // Utility functions for time calculations
// export const formatDuration = (minutes: number): string => {
//   const hours = Math.floor(minutes / 60)
//   const mins = minutes % 60
  
//   if (hours > 0) {
//     return `${hours}h ${mins}m`
//   }
//   return `${mins}m`
// }

// export const calculateDuration = (startTime: string, endTime: string): number => {
//   const start = new Date(startTime)
//   const end = new Date(endTime)
//   return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // minutes
// }



// src/hooks/use-time-entries.ts - OPTIMIZED FOR PERFORMANCE
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface TimeEntry {
  id: string
  description: string
  duration: number // in minutes
  startTime: string
  endTime: string
  date: string
  category: string
  billable: boolean
  createdAt: string
  updatedAt: string
  userId: string
  taskId?: string
  projectId?: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  task?: {
    id: string
    title: string
    status: string
    priority: string
  }
  project?: {
    id: string
    name: string
    status: string
  }
}

export interface TimeEntryFilters {
  search?: string
  filter?: 'today' | 'week' | 'month' | 'all'
  category?: string
  billable?: string
}

export interface CreateTimeEntryData {
  description: string
  duration?: number
  startTime: string
  endTime: string
  date: string
  category: string
  billable: boolean
  taskId?: string
  projectId?: string
}

export interface UpdateTimeEntryData {
  description?: string
  duration?: number
  startTime?: string
  endTime?: string
  date?: string
  category?: string
  billable?: boolean
  taskId?: string
  projectId?: string
}

// ✅ OPTIMIZED API Functions
const fetchTimeEntries = async (filters: TimeEntryFilters = {}): Promise<{
  timeEntries: TimeEntry[]
  total: number
  message: string
}> => {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.filter) params.append('filter', filters.filter)
  if (filters.category) params.append('category', filters.category)
  if (filters.billable) params.append('billable', filters.billable)

  const response = await fetch(`/api/time-entries?${params.toString()}`, {
    headers: {
      'Cache-Control': 'public, max-age=180', // ✅ 3 minute cache - time data is more dynamic
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch time entries: ${response.status}`)
  }

  return response.json()
}

const fetchTimeEntry = async (id: string): Promise<{ timeEntry: TimeEntry }> => {
  const response = await fetch(`/api/time-entries/${id}`, {
    headers: {
      'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache for individual entries
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch time entry: ${response.status}`)
  }

  return response.json()
}

const createTimeEntry = async (entryData: CreateTimeEntryData): Promise<TimeEntry> => {
  const response = await fetch('/api/time-entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entryData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create time entry')
  }

  const result = await response.json()
  return result.timeEntry || result
}

const updateTimeEntry = async ({ id, data }: { id: string; data: UpdateTimeEntryData }): Promise<TimeEntry> => {
  const response = await fetch(`/api/time-entries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update time entry')
  }

  const result = await response.json()
  return result.timeEntry || result
}

const deleteTimeEntry = async (id: string): Promise<void> => {
  const response = await fetch(`/api/time-entries/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to delete time entry')
  }
}

// ✅ OPTIMIZED Main Hook - MAJOR PERFORMANCE IMPROVEMENT
export function useTimeEntries(filters: TimeEntryFilters = {}) {
  return useQuery({
    queryKey: ['time-entries', filters],
    queryFn: () => fetchTimeEntries(filters),
    staleTime: 3 * 60 * 1000, // ✅ 3 minutes - time entries are more dynamic than other data
    gcTime: 10 * 60 * 1000, // ✅ 10 minutes cache
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches - MAJOR PERFORMANCE BOOST
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Faster error handling
    onError: (error: Error) => {
      console.error('Time entries fetch error:', error)
      toast.error('Failed to load time entries')
    },
  })
}

// ✅ OPTIMIZED Single Time Entry Hook
export function useTimeEntry(id: string) {
  return useQuery({
    queryKey: ['time-entries', 'single', id],
    queryFn: () => fetchTimeEntry(id),
    enabled: !!id, // ✅ Only fetch when ID exists
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes for individual entries
    gcTime: 15 * 60 * 1000, // ✅ 15 minutes cache
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches
    retry: 1,
    onError: (error: Error) => {
      console.error('Time entry fetch error:', error)
      toast.error('Failed to load time entry')
    },
  })
}

// ✅ OPTIMIZED Create Time Entry Mutation
export function useCreateTimeEntry() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTimeEntry,
    onSuccess: (newEntry) => {
      // ✅ Optimistic cache update - instant UI update
      queryClient.setQueryData(['time-entries', {}], (old: any) => {
        if (!old) return { timeEntries: [newEntry], total: 1, message: 'Time entry added' }
        return {
          ...old,
          timeEntries: [newEntry, ...old.timeEntries],
          total: old.total + 1
        }
      })
      
      // ✅ Add to individual cache
      queryClient.setQueryData(['time-entries', 'single', newEntry.id], { timeEntry: newEntry })
      
      // ✅ Targeted invalidation for real-time accuracy
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      
      toast.success('Time entry created successfully! ⏰', {
        description: `${formatDuration(newEntry.duration)} logged for ${newEntry.category}`,
      })
    },
    onError: (error: Error) => {
      console.error('Create time entry error:', error)
      toast.error('Failed to create time entry', {
        description: error.message,
      })
    },
  })
}

// ✅ OPTIMIZED Update Time Entry Mutation
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTimeEntry,
    onSuccess: (updatedEntry) => {
      // ✅ Update time entries list cache
      queryClient.setQueryData(['time-entries', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          timeEntries: old.timeEntries?.map((entry: TimeEntry) => 
            entry.id === updatedEntry.id ? updatedEntry : entry
          ) || []
        }
      })
      
      // ✅ Update individual entry cache
      queryClient.setQueryData(['time-entries', 'single', updatedEntry.id], { timeEntry: updatedEntry })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      
      toast.success('Time entry updated successfully! ✅', {
        description: `Updated ${formatDuration(updatedEntry.duration)} entry`,
      })
    },
    onError: (error: Error) => {
      console.error('Update time entry error:', error)
      toast.error('Failed to update time entry', {
        description: error.message,
      })
    },
  })
}

// ✅ OPTIMIZED Delete Time Entry Mutation
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTimeEntry,
    onSuccess: (_, deletedId) => {
      // ✅ Remove from time entries list cache
      queryClient.setQueryData(['time-entries', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          timeEntries: old.timeEntries?.filter((entry: TimeEntry) => entry.id !== deletedId) || [],
          total: Math.max((old.total || 1) - 1, 0)
        }
      })
      
      // ✅ Remove from individual cache
      queryClient.removeQueries({ queryKey: ['time-entries', 'single', deletedId] })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      
      toast.success('Time entry deleted successfully! 🗑️', {
        description: 'The time entry has been removed.',
      })
    },
    onError: (error: Error) => {
      console.error('Delete time entry error:', error)
      toast.error('Failed to delete time entry', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW Time tracking statistics hook
export function useTimeEntryStats(period: 'today' | 'week' | 'month' = 'week') {
  return useQuery({
    queryKey: ['time-entries', 'stats', period],
    queryFn: async () => {
      const response = await fetch(`/api/time-entries/stats?period=${period}`, {
        headers: {
          'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache for stats
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch time entry statistics')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes - stats don't change too often
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ NEW Active time tracking hook for live timer
export function useActiveTimeEntry() {
  return useQuery({
    queryKey: ['time-entries', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/time-entries/active')
      
      if (!response.ok) {
        if (response.status === 404) {
          return null // No active entry
        }
        throw new Error('Failed to fetch active time entry')
      }
      
      return response.json()
    },
    staleTime: 10 * 1000, // ✅ 10 seconds - active entries need frequent updates
    refetchInterval: 30 * 1000, // ✅ Auto-refresh every 30 seconds for live timer
    refetchOnWindowFocus: true, // ✅ Update when user returns to tab
    retry: 1,
  })
}

// ✅ BACKWARD COMPATIBILITY - Keep your existing interface
export interface UseTimeEntriesReturn {
  data: {
    timeEntries: TimeEntry[]
    total: number
    message: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  createTimeEntry: (entryData: any) => Promise<boolean>
  updateTimeEntry: (id: string, updateData: any) => Promise<boolean>
  deleteTimeEntry: (id: string) => Promise<boolean>
}

// ✅ COMPATIBILITY WRAPPER - Use this if you want to keep your exact same interface
export function useTimeEntriesLegacy(filters: TimeEntryFilters = {}): UseTimeEntriesReturn {
  const query = useTimeEntries(filters)
  const createMutation = useCreateTimeEntry()
  const updateMutation = useUpdateTimeEntry()
  const deleteMutation = useDeleteTimeEntry()

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createTimeEntry: async (entryData: any) => {
      try {
        await createMutation.mutateAsync(entryData)
        return true
      } catch {
        return false
      }
    },
    updateTimeEntry: async (id: string, updateData: any) => {
      try {
        await updateMutation.mutateAsync({ id, data: updateData })
        return true
      } catch {
        return false
      }
    },
    deleteTimeEntry: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
  }
}

// ✅ ENHANCED Utility functions for time calculations
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // minutes
}

// ✅ NEW Utility functions
export const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  
  const formatTime = (date: Date) => 
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  
  return `${formatTime(start)} - ${formatTime(end)}`
}

export const getTotalDuration = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => total + entry.duration, 0)
}

export const getBillableHours = (entries: TimeEntry[]): number => {
  return entries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + entry.duration, 0)
}

// ✅ Export types for convenience
export type { CreateTimeEntryData, UpdateTimeEntryData }