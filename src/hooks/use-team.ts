// src/hooks/use-team.ts
import { useState, useEffect } from 'react'
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

export interface UseTeamReturn {
  data: {
    teamMembers: TeamMember[]
    total: number
    message: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTeamMember: (memberData: any) => Promise<boolean>
  updateTeamMember: (id: string, updateData: any) => Promise<boolean>
  removeTeamMember: (id: string) => Promise<boolean>
}

export function useTeam(filters: TeamFilters = {}): UseTeamReturn {
  const [data, setData] = useState<UseTeamReturn['data']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeam = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.role) params.append('role', filters.role)
      if (filters.department) params.append('department', filters.department)

      const response = await fetch(`/api/team?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Team fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load team')
      toast.error('Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }

  const createTeamMember = async (memberData: any): Promise<boolean> => {
    try {
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
      toast.success('Team member invited successfully!')
      
      // Refresh team list
      await fetchTeam()
      return true
    } catch (err) {
      console.error('Create team member error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to invite team member')
      return false
    }
  }

  const updateTeamMember = async (id: string, updateData: any): Promise<boolean> => {
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: updateData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update team member')
      }

      toast.success('Team member updated successfully!')
      
      // Refresh team list
      await fetchTeam()
      return true
    } catch (err) {
      console.error('Update team member error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update team member')
      return false
    }
  }

  const removeTeamMember = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove team member')
      }

      toast.success('Team member removed successfully!')
      
      // Refresh team list
      await fetchTeam()
      return true
    } catch (err) {
      console.error('Remove team member error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to remove team member')
      return false
    }
  }

  const refetch = fetchTeam

  useEffect(() => {
    fetchTeam()
  }, [filters.search, filters.status, filters.role, filters.department])

  return {
    data,
    isLoading,
    error,
    refetch,
    createTeamMember,
    updateTeamMember,
    removeTeamMember,
  }
}

// Hook for getting a single team member
export function useTeamMember(id: string) {
  const [data, setData] = useState<{ teamMember: TeamMember } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeamMember = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/team/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team member: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Team member fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load team member')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTeamMember()
    }
  }, [id])

  return {
    data,
    isLoading,
    error,
    refetch: fetchTeamMember,
  }
}