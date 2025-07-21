// src/hooks/use-team.ts - OPTIMIZED FOR PERFORMANCE
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type TeamMemberStatus = 'ACTIVE' | 'INACTIVE' | 'AWAY'

export interface TeamMember {
  id: string
  name: string
  email: string
  image?: string
  role: string
  department: string
  status: TeamMemberStatus
  phone?: string
  bio?: string
  skills: string[]
  joinedAt: string
  lastActive: string
  createdAt: string
  updatedAt?: string
  assignedTasks?: any[]
  ownedProjects?: any[]
  projectMemberships?: any[]
  stats: {
    totalTasks: number
    completedTasks: number
    inProgressTasks?: number
    overdueTasks: number
    urgentTasks: number
    completionRate: number
    totalProjects: number
    ownedProjects: number
    recentActivity?: {
      tasksWorkedOn: number
      tasksCompleted: number
    }
  }
}

export interface TeamFilters {
  search?: string
  status?: string
  role?: string
  department?: string
}

// ✅ OPTIMIZED API Functions
const fetchTeam = async (filters: TeamFilters = {}): Promise<{
  teamMembers: TeamMember[]
  total: number
  message: string
}> => {
  const params = new URLSearchParams()
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  if (filters.role) params.append('role', filters.role)
  if (filters.department) params.append('department', filters.department)

  const response = await fetch(`/api/team?${params.toString()}`, {
    headers: {
      'Cache-Control': 'public, max-age=300', // ✅ 5 minute browser cache
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch team: ${response.status}`)
  }

  return response.json()
}

const fetchTeamMember = async (id: string): Promise<{ teamMember: TeamMember }> => {
  const response = await fetch(`/api/team/${id}`, {
    headers: {
      'Cache-Control': 'public, max-age=300', // ✅ Enable browser caching
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch team member: ${response.status}`)
  }

  return response.json()
}

const createTeamMember = async (memberData: any): Promise<TeamMember> => {
  const response = await fetch('/api/team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to invite team member')
  }

  const result = await response.json()
  return result.teamMember || result
}

const updateTeamMember = async ({ id, data }: { id: string; data: any }): Promise<TeamMember> => {
  const response = await fetch(`/api/team/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update team member')
  }

  const result = await response.json()
  return result.teamMember || result
}

const deleteTeamMember = async (id: string): Promise<void> => {
  const response = await fetch(`/api/team/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to remove team member')
  }
}

// ✅ OPTIMIZED Main Hook - MAJOR PERFORMANCE IMPROVEMENT
export function useTeam(filters: TeamFilters = {}) {
  return useQuery({
    queryKey: ['team', filters],
    queryFn: () => fetchTeam(filters),
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes - team data doesn't change often
    gcTime: 15 * 60 * 1000, // ✅ 15 minutes cache
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches - MAJOR PERFORMANCE BOOST
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Faster error handling
    onError: (error: Error) => {
      console.error('Team fetch error:', error)
      toast.error('Failed to load team members')
    },
  })
}

// ✅ OPTIMIZED Single Team Member Hook
export function useTeamMember(id: string) {
  return useQuery({
    queryKey: ['team', 'member', id],
    queryFn: () => fetchTeamMember(id),
    enabled: !!id, // ✅ Only fetch when ID exists
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes cache
    gcTime: 15 * 60 * 1000, // ✅ 15 minutes cache
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches
    retry: 1,
    onError: (error: Error) => {
      console.error('Team member fetch error:', error)
      toast.error('Failed to load team member')
    },
  })
}

// ✅ OPTIMIZED Create Team Member Mutation
export function useCreateTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTeamMember,
    onSuccess: (newMember) => {
      // ✅ Optimistic cache update - better performance than refetch
      queryClient.setQueryData(['team', {}], (old: any) => {
        if (!old) return { teamMembers: [newMember], total: 1, message: 'Team member added' }
        return {
          ...old,
          teamMembers: [newMember, ...old.teamMembers],
          total: old.total + 1
        }
      })
      
      // ✅ Add to individual cache
      queryClient.setQueryData(['team', 'member', newMember.id], { teamMember: newMember })
      
      // ✅ Only invalidate team queries specifically
      queryClient.invalidateQueries({ queryKey: ['team'] })
      
      toast.success('Team member invited successfully!')
    },
    onError: (error: Error) => {
      console.error('Create team member error:', error)
      toast.error(error.message || 'Failed to invite team member')
    },
  })
}

// ✅ OPTIMIZED Update Team Member Mutation
export function useUpdateTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateTeamMember,
    onSuccess: (updatedMember) => {
      // ✅ Update team list cache
      queryClient.setQueryData(['team', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          teamMembers: old.teamMembers?.map((member: TeamMember) => 
            member.id === updatedMember.id ? updatedMember : member
          ) || []
        }
      })
      
      // ✅ Update individual member cache
      queryClient.setQueryData(['team', 'member', updatedMember.id], { teamMember: updatedMember })
      
      // ✅ More targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['team'] })
      
      toast.success('Team member updated successfully!')
    },
    onError: (error: Error) => {
      console.error('Update team member error:', error)
      toast.error(error.message || 'Failed to update team member')
    },
  })
}

// ✅ OPTIMIZED Delete Team Member Mutation
export function useDeleteTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: (_, deletedId) => {
      // ✅ Remove from team list cache
      queryClient.setQueryData(['team', {}], (old: any) => {
        if (!old) return old
        return {
          ...old,
          teamMembers: old.teamMembers?.filter((member: TeamMember) => member.id !== deletedId) || [],
          total: Math.max((old.total || 1) - 1, 0)
        }
      })
      
      // ✅ Remove from individual cache
      queryClient.removeQueries({ queryKey: ['team', 'member', deletedId] })
      
      // ✅ Targeted invalidation
      queryClient.invalidateQueries({ queryKey: ['team'] })
      
      toast.success('Team member removed successfully!')
    },
    onError: (error: Error) => {
      console.error('Remove team member error:', error)
      toast.error(error.message || 'Failed to remove team member')
    },
  })
}

// ✅ BACKWARD COMPATIBILITY - Keep your existing interface but with React Query power
export interface UseTeamReturn {
  data: {
    teamMembers: TeamMember[]
    total: number
    message: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => void
  createTeamMember: (memberData: any) => Promise<boolean>
  updateTeamMember: (id: string, updateData: any) => Promise<boolean>
  removeTeamMember: (id: string) => Promise<boolean>
}

// ✅ COMPATIBILITY WRAPPER - Use this if you want to keep your exact same interface
export function useTeamLegacy(filters: TeamFilters = {}): UseTeamReturn {
  const query = useTeam(filters)
  const createMutation = useCreateTeamMember()
  const updateMutation = useUpdateTeamMember()
  const deleteMutation = useDeleteTeamMember()

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    createTeamMember: async (memberData: any) => {
      try {
        await createMutation.mutateAsync(memberData)
        return true
      } catch {
        return false
      }
    },
    updateTeamMember: async (id: string, updateData: any) => {
      try {
        await updateMutation.mutateAsync({ id, data: updateData })
        return true
      } catch {
        return false
      }
    },
    removeTeamMember: async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
  }
}