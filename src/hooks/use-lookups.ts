// src/hooks/use-lookups.ts
import { useQuery } from '@tanstack/react-query'

export interface LookupItem {
  id: string
  name: string
}

export interface SubTaskItem extends LookupItem {
  taskTypeId?: string
}

export interface LookupData {
  modules: LookupItem[]
  departments: LookupItem[]
  taskTypes: LookupItem[]
  subTasks: SubTaskItem[]
  modifyOptions: LookupItem[]
  references: LookupItem[]
}

// Main hook to fetch all lookup data at once
export function useLookups() {
  return useQuery({
    queryKey: ['lookups'],
    queryFn: async (): Promise<LookupData> => {
      const response = await fetch('/api/lookups/all')
      if (!response.ok) {
        throw new Error('Failed to fetch lookup data')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}

// Individual lookup hooks (if you prefer to fetch separately)
export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async (): Promise<LookupItem[]> => {
      const response = await fetch('/api/lookups/modules')
      if (!response.ok) {
        throw new Error('Failed to fetch modules')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<LookupItem[]> => {
      const response = await fetch('/api/lookups/departments')
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useTaskTypes() {
  return useQuery({
    queryKey: ['taskTypes'],
    queryFn: async (): Promise<LookupItem[]> => {
      const response = await fetch('/api/lookups/task-types')
      if (!response.ok) {
        throw new Error('Failed to fetch task types')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubTasks(taskTypeId?: string) {
  return useQuery({
    queryKey: ['subTasks', taskTypeId],
    queryFn: async (): Promise<SubTaskItem[]> => {
      const url = taskTypeId 
        ? `/api/lookups/sub-tasks?taskTypeId=${taskTypeId}`
        : '/api/lookups/sub-tasks'
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch sub tasks')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    enabled: true, // Always enabled, but filtered by taskTypeId on server
  })
}

export function useModifyOptions() {
  return useQuery({
    queryKey: ['modifyOptions'],
    queryFn: async (): Promise<LookupItem[]> => {
      const response = await fetch('/api/lookups/modify-options')
      if (!response.ok) {
        throw new Error('Failed to fetch modify options')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useReferences() {
  return useQuery({
    queryKey: ['references'],
    queryFn: async (): Promise<LookupItem[]> => {
      const response = await fetch('/api/lookups/references')
      if (!response.ok) {
        throw new Error('Failed to fetch references')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}