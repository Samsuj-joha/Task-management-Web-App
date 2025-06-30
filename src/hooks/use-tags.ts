// src/hooks/use-tags.ts
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: string
  tasks: any[]
  _count: {
    tasks: number
  }
  stats: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    todoTasks?: number
    urgentTasks: number
    overdueTasks?: number
    completionRate: number
    recentActivity?: number
  }
  recentTasks: any[]
  tasksByStatus?: {
    TODO: any[]
    IN_PROGRESS: any[]
    COMPLETED: any[]
  }
}

export interface TagFilters {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UseTagsReturn {
  data: {
    tags: Tag[]
    total: number
    message: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTag: (tagData: any) => Promise<boolean>
  updateTag: (id: string, updateData: any) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>
}

export function useTags(filters: TagFilters = {}): UseTagsReturn {
  const [data, setData] = useState<UseTagsReturn['data']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/tags?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Tags fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tags')
      toast.error('Failed to load tags')
    } finally {
      setIsLoading(false)
    }
  }

  const createTag = async (tagData: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tag')
      }

      const result = await response.json()
      toast.success('Tag created successfully!')
      
      // Refresh tags list
      await fetchTags()
      return true
    } catch (err) {
      console.error('Create tag error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to create tag')
      return false
    }
  }

  const updateTag = async (id: string, updateData: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: updateData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tag')
      }

      toast.success('Tag updated successfully!')
      
      // Refresh tags list
      await fetchTags()
      return true
    } catch (err) {
      console.error('Update tag error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update tag')
      return false
    }
  }

  const deleteTag = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete tag')
      }

      toast.success('Tag deleted successfully!')
      
      // Refresh tags list
      await fetchTags()
      return true
    } catch (err) {
      console.error('Delete tag error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete tag')
      return false
    }
  }

  const refetch = fetchTags

  useEffect(() => {
    fetchTags()
  }, [filters.search, filters.sortBy, filters.sortOrder])

  return {
    data,
    isLoading,
    error,
    refetch,
    createTag,
    updateTag,
    deleteTag,
  }
}

// Hook for getting a single tag
export function useTag(id: string) {
  const [data, setData] = useState<{ tag: Tag } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTag = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/tags/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tag: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Tag fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tag')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTag()
    }
  }, [id])

  return {
    data,
    isLoading,
    error,
    refetch: fetchTag,
  }
}