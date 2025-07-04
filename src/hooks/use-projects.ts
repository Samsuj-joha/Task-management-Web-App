// src/hooks/use-projects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline?: string
  startDate?: string
  budget?: number
  color?: string
  createdAt: string
  updatedAt: string
  ownerId: string
  owner: {
    id: string
    name: string
    email: string
    image?: string
  }
  members?: ProjectMember[]
  tasks?: Task[]
  _count: {
    tasks: number
    members: number
  }
}

export interface ProjectMember {
  id: string
  role: 'OWNER' | 'MANAGER' | 'MEMBER'
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export interface Task {
  id: string
  name: string
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assigneeId?: string
  dueDate?: string
  completedAt?: string
}

export interface CreateProjectData {
  name: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
  deadline?: string
  startDate?: string
  budget?: number
  color?: string
  memberEmails?: string[]
}

export interface UpdateProjectData {
  name?: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
  deadline?: string
  startDate?: string
  budget?: number
  color?: string
}

// Fetch all projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('🔄 Fetching projects from API...')
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch projects')
      }
      
      const data = await response.json()
      console.log(`✅ Fetched ${data.projects?.length || 0} projects`)
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
}

// Fetch single project
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      console.log(`🔄 Fetching project ${id} from API...`)
      const response = await fetch(`/api/projects/${id}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch project')
      }
      
      const data = await response.json()
      console.log(`✅ Fetched project: ${data.project?.name}`)
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      console.log('🔄 Creating project:', data.name)
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create project')
      }
      
      const result = await response.json()
      console.log('✅ Project created:', result.project?.name)
      return result
    },
    onSuccess: (result) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      // Add to cache
      queryClient.setQueryData(['projects', result.project.id], result)
      
      // Also invalidate tasks since project counts might change
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Project created successfully! 🎉', {
        description: `${result.project.name} has been created and is ready for tasks.`,
      })
    },
    onError: (error: Error) => {
      console.error('❌ Create project failed:', error)
      toast.error('Failed to create project', {
        description: error.message,
      })
    },
  })
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectData }) => {
      console.log(`🔄 Updating project ${id}:`, data)
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update project')
      }
      
      const result = await response.json()
      console.log('✅ Project updated:', result.project?.name)
      return result
    },
    onSuccess: (result) => {
      // Update projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      // Update single project cache
      queryClient.setQueryData(['projects', result.project.id], result)
      
      // Also invalidate tasks since project status might affect task counts
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Project updated successfully! ✅', {
        description: `${result.project.name} has been updated.`,
      })
    },
    onError: (error: Error) => {
      console.error('❌ Update project failed:', error)
      toast.error('Failed to update project', {
        description: error.message,
      })
    },
  })
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log(`🔄 Deleting project ${id}`)
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete project')
      }
      
      const result = await response.json()
      console.log('✅ Project deleted successfully')
      return result
    },
    onSuccess: (_, deletedId) => {
      // Remove from projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      // Remove from single project cache
      queryClient.removeQueries({ queryKey: ['projects', deletedId] })
      
      // Also invalidate tasks since they might be affected
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      toast.success('Project deleted successfully! 🗑️', {
        description: 'The project and all its data have been removed.',
      })
    },
    onError: (error: Error) => {
      console.error('❌ Delete project failed:', error)
      toast.error('Failed to delete project', {
        description: error.message,
      })
    },
  })
}

// Project members mutations
export function useAddProjectMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ projectId, email, role }: { 
      projectId: string
      email: string
      role: ProjectMember['role']
    }) => {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add member')
      }
      
      return response.json()
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      
      toast.success('Member added successfully! 👥', {
        description: 'The new member has been added to the project.',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to add member', {
        description: error.message,
      })
    },
  })
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ projectId, memberId }: { 
      projectId: string
      memberId: string
    }) => {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to remove member')
      }
      
      return response.json()
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
      
      toast.success('Member removed successfully!', {
        description: 'The member has been removed from the project.',
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to remove member', {
        description: error.message,
      })
    },
  })
}

// Get project statistics
export function useProjectStats() {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/projects/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch project statistics')
      }
      
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}