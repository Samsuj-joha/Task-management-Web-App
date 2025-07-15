// src/hooks/use-notes.ts
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

// API Functions
const notesApi = {
  // Get all notes with filtering
  getNotes: async (params?: {
    filter?: 'all' | 'pinned' | 'recent' | 'archived'
    categoryId?: string
    search?: string
    tags?: string[]
    limit?: number
    offset?: number
  }) => {
    const searchParams = new URLSearchParams()
    
    if (params?.filter) searchParams.append('filter', params.filter)
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.tags?.length) searchParams.append('tags', params.tags.join(','))
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())
    
    const response = await fetch(`/api/notes?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch notes')
    return response.json()
  },

  // Get single note
  getNote: async (id: string) => {
    const response = await fetch(`/api/notes/${id}`)
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
    if (!response.ok) throw new Error('Failed to create note')
    return response.json()
  },

  // Update note
  updateNote: async (id: string, data: UpdateNoteData) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update note')
    return response.json()
  },

  // Delete note
  deleteNote: async (id: string) => {
    const response = await fetch(`/api/notes/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete note')
    return response.json()
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch('/api/notes/categories')
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
    if (!response.ok) throw new Error('Failed to create category')
    return response.json()
  }
}

// Custom Hooks

// Main notes hook
export function useNotes(params?: Parameters<typeof notesApi.getNotes>[0]) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => notesApi.getNotes(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Single note hook
export function useNote(id: string) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: () => notesApi.getNote(id),
    enabled: !!id,
  })
}

// Categories hook
export function useNoteCategories() {
  return useQuery({
    queryKey: ['note-categories'],
    queryFn: notesApi.getCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Create note mutation
export function useCreateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.createNote,
    onSuccess: (newNote) => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note created successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create note')
      console.error('Create note error:', error)
    }
  })
}

// Update note mutation
export function useUpdateNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteData }) =>
      notesApi.updateNote(id, data),
    onSuccess: (updatedNote) => {
      // Update specific note in cache
      queryClient.setQueryData(['notes', updatedNote.id], updatedNote)
      // Invalidate notes list
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update note')
      console.error('Update note error:', error)
    }
  })
}

// Delete note mutation
export function useDeleteNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note deleted successfully!')
    },
    onError: (error) => {
      toast.error('Failed to delete note')
      console.error('Delete note error:', error)
    }
  })
}

// Pin/Unpin note mutation
export function usePinNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      notesApi.updateNote(id, { isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update note')
      console.error('Pin note error:', error)
    }
  })
}

// Archive/Unarchive note mutation
export function useArchiveNote() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      notesApi.updateNote(id, { isArchived }),
    onSuccess: (_, { isArchived }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success(isArchived ? 'Note archived!' : 'Note restored!')
    },
    onError: (error) => {
      toast.error('Failed to update note')
      console.error('Archive note error:', error)
    }
  })
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notesApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-categories'] })
      toast.success('Category created successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create category')
      console.error('Create category error:', error)
    }
  })
}

// Update last viewed timestamp
export function useUpdateLastViewed() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      notesApi.updateNote(id, { lastViewedAt: new Date().toISOString() }),
    onSuccess: (updatedNote) => {
      // Silently update the cache without showing toast
      queryClient.setQueryData(['notes', updatedNote.id], updatedNote)
    },
    onError: (error) => {
      // Silently fail for last viewed updates
      console.error('Update last viewed error:', error)
    }
  })
}