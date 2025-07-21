// // src/hooks/use-tags.ts
// import { useState, useEffect } from 'react'
// import { toast } from 'sonner'

// export interface Tag {
//   id: string
//   name: string
//   color: string
//   createdAt: string
//   tasks: any[]
//   _count: {
//     tasks: number
//   }
//   stats: {
//     totalTasks: number
//     completedTasks: number
//     inProgressTasks: number
//     todoTasks?: number
//     urgentTasks: number
//     overdueTasks?: number
//     completionRate: number
//     recentActivity?: number
//   }
//   recentTasks: any[]
//   tasksByStatus?: {
//     TODO: any[]
//     IN_PROGRESS: any[]
//     COMPLETED: any[]
//   }
// }

// export interface TagFilters {
//   search?: string
//   sortBy?: string
//   sortOrder?: 'asc' | 'desc'
// }

// export interface UseTagsReturn {
//   data: {
//     tags: Tag[]
//     total: number
//     message: string
//   } | null
//   isLoading: boolean
//   error: string | null
//   refetch: () => Promise<void>
//   createTag: (tagData: any) => Promise<boolean>
//   updateTag: (id: string, updateData: any) => Promise<boolean>
//   deleteTag: (id: string) => Promise<boolean>
// }

// export function useTags(filters: TagFilters = {}): UseTagsReturn {
//   const [data, setData] = useState<UseTagsReturn['data']>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchTags = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       // Build query params
//       const params = new URLSearchParams()
//       if (filters.search) params.append('search', filters.search)
//       if (filters.sortBy) params.append('sortBy', filters.sortBy)
//       if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

//       const response = await fetch(`/api/tags?${params.toString()}`)
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch tags: ${response.status}`)
//       }

//       const result = await response.json()
//       setData(result)
//     } catch (err) {
//       console.error('Tags fetch error:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load tags')
//       toast.error('Failed to load tags')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const createTag = async (tagData: any): Promise<boolean> => {
//     try {
//       const response = await fetch('/api/tags', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(tagData),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to create tag')
//       }

//       const result = await response.json()
//       toast.success('Tag created successfully!')
      
//       // Refresh tags list
//       await fetchTags()
//       return true
//     } catch (err) {
//       console.error('Create tag error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to create tag')
//       return false
//     }
//   }

//   const updateTag = async (id: string, updateData: any): Promise<boolean> => {
//     try {
//       const response = await fetch(`/api/tags/${id}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ data: updateData }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to update tag')
//       }

//       toast.success('Tag updated successfully!')
      
//       // Refresh tags list
//       await fetchTags()
//       return true
//     } catch (err) {
//       console.error('Update tag error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to update tag')
//       return false
//     }
//   }

//   const deleteTag = async (id: string): Promise<boolean> => {
//     try {
//       const response = await fetch(`/api/tags/${id}`, {
//         method: 'DELETE',
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to delete tag')
//       }

//       toast.success('Tag deleted successfully!')
      
//       // Refresh tags list
//       await fetchTags()
//       return true
//     } catch (err) {
//       console.error('Delete tag error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to delete tag')
//       return false
//     }
//   }

//   const refetch = fetchTags

//   useEffect(() => {
//     fetchTags()
//   }, [filters.search, filters.sortBy, filters.sortOrder])

//   return {
//     data,
//     isLoading,
//     error,
//     refetch,
//     createTag,
//     updateTag,
//     deleteTag,
//   }
// }

// // Hook for getting a single tag
// export function useTag(id: string) {
//   const [data, setData] = useState<{ tag: Tag } | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchTag = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       const response = await fetch(`/api/tags/${id}`)
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch tag: ${response.status}`)
//       }

//       const result = await response.json()
//       setData(result)
//     } catch (err) {
//       console.error('Tag fetch error:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load tag')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (id) {
//       fetchTag()
//     }
//   }, [id])

//   return {
//     data,
//     isLoading,
//     error,
//     refetch: fetchTag,
//   }
// }





// src/hooks/use-tags.ts - OPTIMIZED FOR PERFORMANCE
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export interface CreateTagData {
  name: string
  color: string
  description?: string
}

export interface UpdateTagData {
  name?: string
  color?: string
  description?: string
}

// ✅ OPTIMIZED API Functions
const fetchTags = async (filters: TagFilters = {}): Promise<{
  tags: Tag[]
  total: number
  message: string
}> => {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

  const response = await fetch(`/api/tags?${params.toString()}`, {
    headers: {
      'Cache-Control': 'public, max-age=600', // ✅ 10 minute browser cache - tags are stable
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.status}`)
  }

  return response.json()
}

const fetchTag = async (id: string): Promise<{ tag: Tag }> => {
  const response = await fetch(`/api/tags/${id}`, {
    headers: {
      'Cache-Control': 'public, max-age=600', // ✅ 10 minute cache for individual tags
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tag: ${response.status}`)
  }

  return response.json()
}

const createTag = async (tagData: CreateTagData): Promise<Tag> => {
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
  return result.tag || result
}

const updateTag = async ({ id, data }: { id: string; data: UpdateTagData }): Promise<Tag> => {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update tag')
  }

  const result = await response.json()
  return result.tag || result
}

const deleteTag = async (id: string): Promise<void> => {
  const response = await fetch(`/api/tags/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to delete tag')
  }
}

// ✅ OPTIMIZED Main Tags Hook - MAJOR PERFORMANCE IMPROVEMENT
export function useTags(filters: TagFilters = {}) {
  return useQuery({
    queryKey: ['tags', filters],
    queryFn: () => fetchTags(filters),
    staleTime: 15 * 60 * 1000, // ✅ 15 minutes - tags are very stable data
    gcTime: 30 * 60 * 1000, // ✅ 30 minutes cache - tags rarely change
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches - MAJOR PERFORMANCE BOOST
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Faster error handling
    onError: (error: Error) => {
      console.error('Tags fetch error:', error)
      toast.error('Failed to load tags')
    },
  })
}

// ✅ OPTIMIZED Single Tag Hook
export function useTag(id: string) {
  return useQuery({
    queryKey: ['tags', 'single', id],
    queryFn: () => fetchTag(id),
    enabled: !!id, // ✅ Only fetch when ID exists
    staleTime: 15 * 60 * 1000, // ✅ 15 minutes for individual tags
    gcTime: 30 * 60 * 1000, // ✅ 30 minutes cache
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches
    retry: 1,
    onError: (error: Error) => {
      console.error('Tag fetch error:', error)
      toast.error('Failed to load tag')
    },
  })
}

// ✅ OPTIMIZED Create Tag Mutation
export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTag,
    onSuccess: (newTag) => {
      // ✅ Optimistic cache update - instant UI update
      queryClient.setQueryData(['tags', {}], (old: any) => {
        if (!old) return { tags: [newTag], total: 1, message: 'Tag created' }
        return {
          ...old,
          tags: [newTag, ...old.tags],
          total: old.total + 1
        }
      })
      
      // ✅ Add to individual tag cache
      queryClient.setQueryData(['tags', 'single', newTag.id], { tag: newTag })
      
      // ✅ Targeted invalidation for tag lists
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      
      // ✅ Also invalidate tasks since they might have tag relationships
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Tag created successfully! 🏷️', {
        description: `"${newTag.name}" tag is ready to use.`,
      })
    },
    onError: (error: Error) => {
      console.error('Create tag error:', error)
      toast.error('Failed to create tag', {
        description: error.message,
      })
    },
  })
}

// ✅ OPTIMIZED Update Tag Mutation
export function useUpdateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTag,
    onMutate: async ({ id, data }) => {
      // ✅ Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tags'] })

      // ✅ Snapshot the previous value
      const previousTags = queryClient.getQueryData(['tags', {}])
      const previousTag = queryClient.getQueryData(['tags', 'single', id])

      // ✅ Optimistically update tags list
      queryClient.setQueryData(['tags', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tags: old.tags?.map((tag: Tag) => 
            tag.id === id ? { ...tag, ...data } : tag
          ) || []
        }
      })

      // ✅ Optimistically update individual tag
      queryClient.setQueryData(['tags', 'single', id], (old: any) => {
        if (!old) return old
        return { tag: { ...old.tag, ...data } }
      })

      return { previousTags, previousTag }
    },
    onSuccess: (updatedTag) => {
      // ✅ Update with server response
      queryClient.setQueryData(['tags', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tags: old.tags?.map((tag: Tag) => 
            tag.id === updatedTag.id ? updatedTag : tag
          ) || []
        }
      })
      
      // ✅ Update individual tag cache
      queryClient.setQueryData(['tags', 'single', updatedTag.id], { tag: updatedTag })
      
      // ✅ Invalidate related data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Tag updated successfully! ✅', {
        description: `"${updatedTag.name}" has been updated.`,
      })
    },
    onError: (error: Error, _, context) => {
      // ✅ Rollback optimistic updates on error
      if (context?.previousTags) {
        queryClient.setQueryData(['tags', {}], context.previousTags)
      }
      if (context?.previousTag) {
        queryClient.setQueryData(['tags', 'single', _.id], context.previousTag)
      }
      
      console.error('Update tag error:', error)
      toast.error('Failed to update tag', {
        description: error.message,
      })
    },
    onSettled: () => {
      // ✅ Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

// ✅ OPTIMIZED Delete Tag Mutation
export function useDeleteTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTag,
    onMutate: async (deletedId) => {
      // ✅ Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tags'] })

      // ✅ Snapshot the previous value
      const previousTags = queryClient.getQueryData(['tags', {}])

      // ✅ Optimistically remove tag from list
      queryClient.setQueryData(['tags', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tags: old.tags?.filter((tag: Tag) => tag.id !== deletedId) || [],
          total: Math.max((old.total || 1) - 1, 0)
        }
      })

      return { previousTags }
    },
    onSuccess: (_, deletedId) => {
      // ✅ Remove from individual tag cache
      queryClient.removeQueries({ queryKey: ['tags', 'single', deletedId] })
      
      // ✅ Invalidate related data
      queryClient.invalidateQueries({ queryKey: ['tasks'] }) // Tasks might have this tag
      
      toast.success('Tag deleted successfully! 🗑️', {
        description: 'The tag has been removed from all tasks.',
      })
    },
    onError: (error: Error, _, context) => {
      // ✅ Rollback optimistic update on error
      if (context?.previousTags) {
        queryClient.setQueryData(['tags', {}], context.previousTags)
      }
      
      console.error('Delete tag error:', error)
      toast.error('Failed to delete tag', {
        description: error.message,
      })
    },
    onSettled: () => {
      // ✅ Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })
}

// ✅ NEW Popular Tags Hook
export function usePopularTags(limit: number = 10) {
  return useQuery({
    queryKey: ['tags', 'popular', limit],
    queryFn: async () => {
      const response = await fetch(`/api/tags/popular?limit=${limit}`, {
        headers: {
          'Cache-Control': 'public, max-age=900', // ✅ 15 minute cache for popular tags
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular tags')
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes - popular tags change slowly
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ NEW Tag Statistics Hook
export function useTagStats() {
  return useQuery({
    queryKey: ['tags', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/tags/stats', {
        headers: {
          'Cache-Control': 'public, max-age=600', // ✅ 10 minute cache for stats
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch tag statistics')
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes - stats don't change too often
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ NEW Bulk Tag Operations
export function useBulkTagOperations() {
  const queryClient = useQueryClient()
  
  const bulkDelete = useMutation({
    mutationFn: async (tagIds: string[]) => {
      const response = await fetch('/api/tags/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete tags')
      }
      
      return response.json()
    },
    onSuccess: (_, deletedIds) => {
      // ✅ Remove all deleted tags from cache
      queryClient.setQueryData(['tags', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tags: old.tags?.filter((tag: Tag) => !deletedIds.includes(tag.id)) || [],
          total: old.total - deletedIds.length
        }
      })
      
      // ✅ Remove from individual caches
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: ['tags', 'single', id] })
      })
      
      // ✅ Invalidate related data
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success(`${deletedIds.length} tags deleted successfully! 🗑️`)
    },
    onError: (error: Error) => {
      toast.error('Failed to delete tags', {
        description: error.message,
      })
    },
  })

  const bulkUpdate = useMutation({
    mutationFn: async ({ tagIds, data }: { tagIds: string[]; data: UpdateTagData }) => {
      const response = await fetch('/api/tags/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds, data }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update tags')
      }
      
      return response.json()
    },
    onSuccess: (updatedTags, { tagIds }) => {
      // ✅ Update cache with new data
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success(`${tagIds.length} tags updated successfully! ✅`)
    },
    onError: (error: Error) => {
      toast.error('Failed to update tags', {
        description: error.message,
      })
    },
  })

  return { bulkDelete, bulkUpdate }
}

// ✅ BACKWARD COMPATIBILITY - Keep your existing interface
export interface UseTagsReturn {
  data: {
    tags: Tag[]
    total: number
    message: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  createTag: (tagData: any) => Promise<boolean>
  updateTag: (id: string, updateData: any) => Promise<boolean>
  deleteTag: (id: string) => Promise<boolean>
}

// ✅ COMPATIBILITY WRAPPER - Use this if you want to keep your exact same interface
export function useTagsLegacy(filters: TagFilters = {}): UseTagsReturn {
  const query = useTags(filters)
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()
  const deleteMutation = useDeleteTag()

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createTag: async (tagData: any) => {
      try {
        await createMutation.mutateAsync(tagData)
        return true
      } catch {
        return false
      }
    },
    updateTag: async (id: string, updateData: any) => {
      try {
        await updateMutation.mutateAsync({ id, data: updateData })
        return true
      } catch {
        return false
      }
    },
    deleteTag: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
  }
}

// ✅ Utility functions for tag management
export const getTagColor = (color: string): string => {
  // Ensure color has # prefix
  return color.startsWith('#') ? color : `#${color}`
}

export const generateTagColor = (): string => {
  // Generate a random pleasant color for new tags
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F43F5E', '#22C55E', '#EAB308', '#A855F7'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export const sortTagsByUsage = (tags: Tag[]): Tag[] => {
  return [...tags].sort((a, b) => b.stats.totalTasks - a.stats.totalTasks)
}

export const getTagUsageLevel = (tag: Tag): 'low' | 'medium' | 'high' => {
  const usage = tag.stats.totalTasks
  if (usage >= 10) return 'high'
  if (usage >= 3) return 'medium'
  return 'low'
}

// ✅ Export types for convenience
export type { CreateTagData, UpdateTagData }