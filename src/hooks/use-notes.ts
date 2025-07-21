// // src/hooks/use-notes.ts
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { toast } from 'sonner'

// // Types
// export interface Note {
//   id: string
//   title: string
//   content: string
//   categoryId?: string
//   category?: {
//     id: string
//     name: string
//     color: string
//     icon?: string
//   }
//   isPinned: boolean
//   isArchived: boolean
//   priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   tags: string[]
//   createdAt: string
//   updatedAt: string
//   lastViewedAt?: string
//   author: {
//     id: string
//     name?: string
//     email: string
//   }
// }

// export interface NoteCategory {
//   id: string
//   name: string
//   color: string
//   icon?: string
//   isActive: boolean
//   sortOrder?: number
//   _count?: {
//     notes: number
//   }
// }

// export interface CreateNoteData {
//   title: string
//   content: string
//   categoryId?: string
//   isPinned?: boolean
//   priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
//   tags?: string[]
// }

// export interface UpdateNoteData extends Partial<CreateNoteData> {
//   isArchived?: boolean
//   lastViewedAt?: string
// }

// // API Functions
// const notesApi = {
//   // Get all notes with filtering
//   getNotes: async (params?: {
//     filter?: 'all' | 'pinned' | 'recent' | 'archived'
//     categoryId?: string
//     search?: string
//     tags?: string[]
//     limit?: number
//     offset?: number
//   }) => {
//     const searchParams = new URLSearchParams()
    
//     if (params?.filter) searchParams.append('filter', params.filter)
//     if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
//     if (params?.search) searchParams.append('search', params.search)
//     if (params?.tags?.length) searchParams.append('tags', params.tags.join(','))
//     if (params?.limit) searchParams.append('limit', params.limit.toString())
//     if (params?.offset) searchParams.append('offset', params.offset.toString())
    
//     const response = await fetch(`/api/notes?${searchParams}`)
//     if (!response.ok) throw new Error('Failed to fetch notes')
//     return response.json()
//   },

//   // Get single note
//   getNote: async (id: string) => {
//     const response = await fetch(`/api/notes/${id}`)
//     if (!response.ok) throw new Error('Failed to fetch note')
//     return response.json()
//   },

//   // Create new note
//   createNote: async (data: CreateNoteData) => {
//     const response = await fetch('/api/notes', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     })
//     if (!response.ok) throw new Error('Failed to create note')
//     return response.json()
//   },

//   // Update note
//   updateNote: async (id: string, data: UpdateNoteData) => {
//     const response = await fetch(`/api/notes/${id}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     })
//     if (!response.ok) throw new Error('Failed to update note')
//     return response.json()
//   },

//   // Delete note
//   deleteNote: async (id: string) => {
//     const response = await fetch(`/api/notes/${id}`, {
//       method: 'DELETE'
//     })
//     if (!response.ok) throw new Error('Failed to delete note')
//     return response.json()
//   },

//   // Get categories
//   getCategories: async () => {
//     const response = await fetch('/api/notes/categories')
//     if (!response.ok) throw new Error('Failed to fetch categories')
//     return response.json()
//   },

//   // Create category
//   createCategory: async (data: { name: string; color: string; icon?: string }) => {
//     const response = await fetch('/api/notes/categories', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     })
//     if (!response.ok) throw new Error('Failed to create category')
//     return response.json()
//   }
// }

// // Custom Hooks

// // Main notes hook
// export function useNotes(params?: Parameters<typeof notesApi.getNotes>[0]) {
//   return useQuery({
//     queryKey: ['notes', params],
//     queryFn: () => notesApi.getNotes(params),
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   })
// }

// // Single note hook
// export function useNote(id: string) {
//   return useQuery({
//     queryKey: ['notes', id],
//     queryFn: () => notesApi.getNote(id),
//     enabled: !!id,
//   })
// }

// // Categories hook
// export function useNoteCategories() {
//   return useQuery({
//     queryKey: ['note-categories'],
//     queryFn: notesApi.getCategories,
//     staleTime: 1000 * 60 * 10, // 10 minutes
//   })
// }

// // Create note mutation
// export function useCreateNote() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: notesApi.createNote,
//     onSuccess: (newNote) => {
//       // Invalidate and refetch notes
//       queryClient.invalidateQueries({ queryKey: ['notes'] })
//       toast.success('Note created successfully!')
//     },
//     onError: (error) => {
//       toast.error('Failed to create note')
//       console.error('Create note error:', error)
//     }
//   })
// }

// // Update note mutation
// export function useUpdateNote() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) =>
//       notesApi.updateNote(id, data),
//     onSuccess: (updatedNote) => {
//       // Update specific note in cache
//       queryClient.setQueryData(['notes', updatedNote.id], updatedNote)
//       // Invalidate notes list
//       queryClient.invalidateQueries({ queryKey: ['notes'] })
//       toast.success('Note updated successfully!')
//     },
//     onError: (error) => {
//       toast.error('Failed to update note')
//       console.error('Update note error:', error)
//     }
//   })
// }

// // Delete note mutation
// export function useDeleteNote() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: notesApi.deleteNote,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['notes'] })
//       toast.success('Note deleted successfully!')
//     },
//     onError: (error) => {
//       toast.error('Failed to delete note')
//       console.error('Delete note error:', error)
//     }
//   })
// }

// // Pin/Unpin note mutation
// export function usePinNote() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
//       notesApi.updateNote(id, { isPinned }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['notes'] })
//       toast.success('Note updated successfully!')
//     },
//     onError: (error) => {
//       toast.error('Failed to update note')
//       console.error('Pin note error:', error)
//     }
//   })
// }

// // Archive/Unarchive note mutation
// export function useArchiveNote() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
//       notesApi.updateNote(id, { isArchived }),
//     onSuccess: (_, { isArchived }) => {
//       queryClient.invalidateQueries({ queryKey: ['notes'] })
//       toast.success(isArchived ? 'Note archived!' : 'Note restored!')
//     },
//     onError: (error) => {
//       toast.error('Failed to update note')
//       console.error('Archive note error:', error)
//     }
//   })
// }

// // Create category mutation
// export function useCreateCategory() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: notesApi.createCategory,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['note-categories'] })
//       toast.success('Category created successfully!')
//     },
//     onError: (error) => {
//       toast.error('Failed to create category')
//       console.error('Create category error:', error)
//     }
//   })
// }

// // Update last viewed timestamp
// export function useUpdateLastViewed() {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: (id: string) =>
//       notesApi.updateNote(id, { lastViewedAt: new Date().toISOString() }),
//     onSuccess: (updatedNote) => {
//       // Silently update the cache without showing toast
//       queryClient.setQueryData(['notes', updatedNote.id], updatedNote)
//     },
//     onError: (error) => {
//       // Silently fail for last viewed updates
//       console.error('Update last viewed error:', error)
//     }
//   })
// }




// src/hooks/use-notes.ts - OPTIMIZED FOR MAXIMUM PERFORMANCE
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// Types
export interface Note {
  id: string
  title: string
  content: string
  categoryId?: string
  category?: {
    id: string
    name: string
    color: string
    icon?: string
  }
  isPinned: boolean
  isArchived: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags: string[]
  createdAt: string
  updatedAt: string
  lastViewedAt?: string
  author: {
    id: string
    name?: string
    email: string
  }
}

export interface NoteCategory {
  id: string
  name: string
  color: string
  icon?: string
  isActive: boolean
  sortOrder?: number
  _count?: {
    notes: number
  }
}

export interface CreateNoteData {
  title: string
  content: string
  categoryId?: string
  isPinned?: boolean
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags?: string[]
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  isArchived?: boolean
  lastViewedAt?: string
}

export interface NotesFilters {
  filter?: 'all' | 'pinned' | 'recent' | 'archived'
  categoryId?: string
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
}

// ✅ OPTIMIZED API Functions
const notesApi = {
  // Get all notes with filtering
  getNotes: async (params?: NotesFilters) => {
    const searchParams = new URLSearchParams()
    
    if (params?.filter) searchParams.append('filter', params.filter)
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.tags?.length) searchParams.append('tags', params.tags.join(','))
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    const response = await fetch(`/api/notes?${searchParams}`, {
      headers: {
        'Cache-Control': 'public, max-age=120', // ✅ 2 minute browser cache - notes change frequently
      },
    })
    if (!response.ok) throw new Error('Failed to fetch notes')
    return response.json()
  },

  // Get single note
  getNote: async (id: string) => {
    const response = await fetch(`/api/notes/${id}`, {
      headers: {
        'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache for individual notes
      },
    })
    if (!response.ok) throw new Error('Failed to fetch note')
    return response.json()
  },

  // Create new note
  createNote: async (data: CreateNoteData) => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create note')
    }
    return response.json()
  },

  // Update note
  updateNote: async (id: string, data: UpdateNoteData) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update note')
    }
    return response.json()
  },

  // Delete note
  deleteNote: async (id: string) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete note')
    }
    return response.json()
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch('/api/notes/categories', {
      headers: {
        'Cache-Control': 'public, max-age=600', // ✅ 10 minute cache - categories rarely change
      },
    })
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  // Create category
  createCategory: async (data: { name: string; color: string; icon?: string }) => {
    const response = await fetch('/api/notes/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create category')
    }
    return response.json()
  }
}

// ✅ OPTIMIZED Custom Hooks

// Main notes hook with enhanced performance
export function useNotes(params?: NotesFilters) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => notesApi.getNotes(params),
    staleTime: 2 * 60 * 1000, // ✅ 2 minutes - notes are dynamic content
    gcTime: 10 * 60 * 1000, // ✅ 10 minutes cache
    refetchOnWindowFocus: false, // ✅ Prevent unnecessary refetches - MAJOR PERFORMANCE BOOST
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Faster error handling
    onError: (error: Error) => {
      console.error('Notes fetch error:', error)
      toast.error('Failed to load notes')
    },
  })
}

// Single note hook with enhanced performance
export function useNote(id: string) {
  return useQuery({
    queryKey: ['notes', 'single', id],
    queryFn: () => notesApi.getNote(id),
    enabled: !!id, // ✅ Only fetch when ID exists
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes for individual notes
    gcTime: 15 * 60 * 1000, // ✅ 15 minutes cache
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches
    retry: 1,
    onError: (error: Error) => {
      console.error('Note fetch error:', error)
      toast.error('Failed to load note')
    },
  })
}

// Categories hook with enhanced performance
export function useNoteCategories() {
  return useQuery({
    queryKey: ['note-categories'],
    queryFn: notesApi.getCategories,
    staleTime: 15 * 60 * 1000, // ✅ Increased from 10 to 15 minutes - categories rarely change
    gcTime: 30 * 60 * 1000, // ✅ 30 minutes cache - categories are very stable
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches
    refetchOnMount: false, // ✅ Use cache first
    retry: 1,
  })
}

// ✅ OPTIMIZED Create note mutation
export function useCreateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.createNote,
    onSuccess: (result) => {
      const newNote = result.note || result
      
      // ✅ Optimistic cache update - instant UI update
      queryClient.setQueryData(['notes', {}], (old: any) => {
        if (!old) return { notes: [newNote], total: 1 }
        return {
          notes: [newNote, ...old.notes],
          total: (old.total || 0) + 1
        }
      })
      
      // ✅ Add to individual note cache
      queryClient.setQueryData(['notes', 'single', newNote.id], { note: newNote })
      
      // ✅ More targeted invalidation for better performance
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      
      toast.success('Note created successfully! 📝', {
        description: `"${newNote.title}" has been saved.`,
      })
    },
    onError: (error: Error) => {
      console.error('Create note error:', error)
      toast.error('Failed to create note', {
        description: error.message,
      })
    }
  })
}

// ✅ OPTIMIZED Update note mutation
export function useUpdateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) =>
      notesApi.updateNote(id, data),
    onSuccess: (result) => {
      const updatedNote = result.note || result
      
      // ✅ Update notes list cache
      queryClient.setQueryData(['notes', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notes: old.notes?.map((note: Note) => 
            note.id === updatedNote.id ? updatedNote : note
          ) || []
        }
      })
      
      // ✅ Update individual note cache
      queryClient.setQueryData(['notes', 'single', updatedNote.id], { note: updatedNote })
      
      // ✅ More targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      
      toast.success('Note updated successfully! ✅', {
        description: `"${updatedNote.title}" has been updated.`,
      })
    },
    onError: (error: Error) => {
      console.error('Update note error:', error)
      toast.error('Failed to update note', {
        description: error.message,
      })
    }
  })
}

// ✅ OPTIMIZED Delete note mutation
export function useDeleteNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: (_, deletedId) => {
      // ✅ Remove from notes list cache
      queryClient.setQueryData(['notes', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notes: old.notes?.filter((note: Note) => note.id !== deletedId) || [],
          total: Math.max((old.total || 1) - 1, 0)
        }
      })
      
      // ✅ Remove from individual note cache
      queryClient.removeQueries({ queryKey: ['notes', 'single', deletedId] })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      
      toast.success('Note deleted successfully! 🗑️', {
        description: 'The note has been removed.',
      })
    },
    onError: (error: Error) => {
      console.error('Delete note error:', error)
      toast.error('Failed to delete note', {
        description: error.message,
      })
    }
  })
}

// ✅ OPTIMIZED Pin/Unpin note mutation
export function usePinNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      notesApi.updateNote(id, { isPinned }),
    onSuccess: (result, { isPinned }) => {
      const updatedNote = result.note || result
      
      // ✅ Update cache directly for instant feedback
      queryClient.setQueryData(['notes', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notes: old.notes?.map((note: Note) => 
            note.id === updatedNote.id ? updatedNote : note
          ) || []
        }
      })
      
      // ✅ Update individual note cache
      queryClient.setQueryData(['notes', 'single', updatedNote.id], { note: updatedNote })
      
      // ✅ More targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      
      toast.success(isPinned ? 'Note pinned! 📌' : 'Note unpinned! 📝', {
        description: `"${updatedNote.title}" has been ${isPinned ? 'pinned' : 'unpinned'}.`,
      })
    },
    onError: (error: Error) => {
      console.error('Pin note error:', error)
      toast.error('Failed to update note', {
        description: error.message,
      })
    }
  })
}

// ✅ OPTIMIZED Archive/Unarchive note mutation
export function useArchiveNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      notesApi.updateNote(id, { isArchived }),
    onSuccess: (result, { isArchived }) => {
      const updatedNote = result.note || result
      
      // ✅ Update cache directly for instant feedback
      queryClient.setQueryData(['notes', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notes: old.notes?.map((note: Note) => 
            note.id === updatedNote.id ? updatedNote : note
          ) || []
        }
      })
      
      // ✅ Update individual note cache
      queryClient.setQueryData(['notes', 'single', updatedNote.id], { note: updatedNote })
      
      // ✅ More targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      
      toast.success(isArchived ? 'Note archived! 📦' : 'Note restored! 📝', {
        description: `"${updatedNote.title}" has been ${isArchived ? 'archived' : 'restored'}.`,
      })
    },
    onError: (error: Error) => {
      console.error('Archive note error:', error)
      toast.error('Failed to update note', {
        description: error.message,
      })
    }
  })
}

// ✅ OPTIMIZED Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.createCategory,
    onSuccess: (result) => {
      const newCategory = result.category || result
      
      // ✅ Optimistic cache update for categories
      queryClient.setQueryData(['note-categories'], (old: any) => {
        if (!old) return { categories: [newCategory] }
        return {
          ...old,
          categories: [newCategory, ...(old.categories || [])]
        }
      })
      
      // ✅ Invalidate notes to update category counts
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      
      toast.success('Category created successfully! 🏷️', {
        description: `"${newCategory.name}" category has been added.`,
      })
    },
    onError: (error: Error) => {
      console.error('Create category error:', error)
      toast.error('Failed to create category', {
        description: error.message,
      })
    }
  })
}

// ✅ OPTIMIZED Update last viewed timestamp (silent)
export function useUpdateLastViewed() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      notesApi.updateNote(id, { lastViewedAt: new Date().toISOString() }),
    onSuccess: (result) => {
      const updatedNote = result.note || result
      
      // ✅ Silently update the cache without toast notifications
      queryClient.setQueryData(['notes', 'single', updatedNote.id], { note: updatedNote })
      
      // ✅ Update in notes list cache too
      queryClient.setQueryData(['notes', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          notes: old.notes?.map((note: Note) => 
            note.id === updatedNote.id ? updatedNote : note
          ) || []
        }
      })
    },
    onError: (error: Error) => {
      // ✅ Silently fail for last viewed updates - not critical
      console.error('Update last viewed error:', error)
    }
  })
}

// ✅ NEW Notes statistics hook
export function useNotesStats() {
  return useQuery({
    queryKey: ['notes', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/notes/stats', {
        headers: {
          'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache for stats
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch notes statistics')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes - stats don't change too often
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ NEW Recent notes hook for quick access
export function useRecentNotes(limit: number = 5) {
  return useQuery({
    queryKey: ['notes', 'recent', limit],
    queryFn: () => notesApi.getNotes({ 
      filter: 'recent', 
      limit 
    }),
    staleTime: 1 * 60 * 1000, // ✅ 1 minute - recent notes should be fresh
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ Export types for convenience
export type { NotesFilters }