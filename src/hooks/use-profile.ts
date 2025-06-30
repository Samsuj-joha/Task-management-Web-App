// src/hooks/use-profile.ts
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface ProfileData {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
  image?: string
  role?: string
  department?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  status?: string
  isActive?: boolean
  joinedAt?: string
  lastActive?: string
  createdAt?: string
  updatedAt?: string
}

export interface UseProfileReturn {
  profile: ProfileData | null
  isLoading: boolean
  error: string | null
  updateProfile: (data: Partial<ProfileData>) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const result = await response.json()
      
      // Safely access user data
      if (result.user) {
        setProfile(result.user)
      } else {
        throw new Error('No user data returned')
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<ProfileData>): Promise<boolean> => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const result = await response.json()
      
      if (result.user) {
        setProfile(result.user)
        toast.success('Profile updated successfully!')
        return true
      } else {
        throw new Error('No user data returned after update')
      }
    } catch (err) {
      console.error('Update profile error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile,
  }
}