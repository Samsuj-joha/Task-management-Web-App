// src/hooks/use-time-entries.ts
import { useState, useEffect } from 'react'
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

export interface UseTimeEntriesReturn {
  data: {
    timeEntries: TimeEntry[]
    total: number
    message: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTimeEntry: (entryData: any) => Promise<boolean>
  updateTimeEntry: (id: string, updateData: any) => Promise<boolean>
  deleteTimeEntry: (id: string) => Promise<boolean>
}

export function useTimeEntries(filters: TimeEntryFilters = {}): UseTimeEntriesReturn {
  const [data, setData] = useState<UseTimeEntriesReturn['data']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeEntries = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.filter) params.append('filter', filters.filter)
      if (filters.category) params.append('category', filters.category)
      if (filters.billable) params.append('billable', filters.billable)

      const response = await fetch(`/api/time-entries?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch time entries: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Time entries fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load time entries')
      toast.error('Failed to load time entries')
    } finally {
      setIsLoading(false)
    }
  }

  const createTimeEntry = async (entryData: any): Promise<boolean> => {
    try {
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
      toast.success('Time entry created successfully!')
      
      // Refresh time entries list
      await fetchTimeEntries()
      return true
    } catch (err) {
      console.error('Create time entry error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create time entry')
      return false
    }
  }

  const updateTimeEntry = async (id: string, updateData: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: updateData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update time entry')
      }

      toast.success('Time entry updated successfully!')
      
      // Refresh time entries list
      await fetchTimeEntries()
      return true
    } catch (err) {
      console.error('Update time entry error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update time entry')
      return false
    }
  }

  const deleteTimeEntry = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete time entry')
      }

      toast.success('Time entry deleted successfully!')
      
      // Refresh time entries list
      await fetchTimeEntries()
      return true
    } catch (err) {
      console.error('Delete time entry error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete time entry')
      return false
    }
  }

  const refetch = fetchTimeEntries

  useEffect(() => {
    fetchTimeEntries()
  }, [filters.search, filters.filter, filters.category, filters.billable])

  return {
    data,
    isLoading,
    error,
    refetch,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  }
}

// Hook for getting a single time entry
export function useTimeEntry(id: string) {
  const [data, setData] = useState<{ timeEntry: TimeEntry } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeEntry = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/time-entries/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch time entry: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Time entry fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load time entry')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTimeEntry()
    }
  }, [id])

  return {
    data,
    isLoading,
    error,
    refetch: fetchTimeEntry,
  }
}

// Utility functions for time calculations
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