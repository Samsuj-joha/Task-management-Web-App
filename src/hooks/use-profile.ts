// // src/hooks/use-profile.ts
// import { useState, useEffect } from 'react'
// import { toast } from 'sonner'

// export interface ProfileData {
//   id: string
//   name?: string
//   firstName?: string
//   lastName?: string
//   email: string
//   image?: string
//   role?: string
//   department?: string
//   phone?: string
//   location?: string
//   bio?: string
//   skills?: string[]
//   status?: string
//   isActive?: boolean
//   joinedAt?: string
//   lastActive?: string
//   createdAt?: string
//   updatedAt?: string
// }

// export interface UseProfileReturn {
//   profile: ProfileData | null
//   isLoading: boolean
//   error: string | null
//   updateProfile: (data: Partial<ProfileData>) => Promise<boolean>
//   refetch: () => Promise<void>
// }

// export function useProfile(): UseProfileReturn {
//   const [profile, setProfile] = useState<ProfileData | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchProfile = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)

//       const response = await fetch('/api/profile')
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch profile: ${response.status}`)
//       }

//       const result = await response.json()
      
//       // Safely access user data
//       if (result.user) {
//         setProfile(result.user)
//       } else {
//         throw new Error('No user data returned')
//       }
//     } catch (err) {
//       console.error('Profile fetch error:', err)
//       setError(err instanceof Error ? err.message : 'Failed to load profile')
//       toast.error('Failed to load profile')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const updateProfile = async (data: Partial<ProfileData>): Promise<boolean> => {
//     try {
//       const response = await fetch('/api/profile', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || 'Failed to update profile')
//       }

//       const result = await response.json()
      
//       if (result.user) {
//         setProfile(result.user)
//         toast.success('Profile updated successfully!')
//         return true
//       } else {
//         throw new Error('No user data returned after update')
//       }
//     } catch (err) {
//       console.error('Update profile error:', err)
//       toast.error(err instanceof Error ? err.message : 'Failed to update profile')
//       return false
//     }
//   }

//   useEffect(() => {
//     fetchProfile()
//   }, [])

//   return {
//     profile,
//     isLoading,
//     error,
//     updateProfile,
//     refetch: fetchProfile,
//   }
// }




// src/hooks/use-profile.ts - OPTIMIZED FOR PERFORMANCE
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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

export interface UpdateProfileData {
  name?: string
  firstName?: string
  lastName?: string
  image?: string
  phone?: string
  location?: string
  bio?: string
  skills?: string[]
  status?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ProfilePreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  weeklyReports?: boolean
}

// ✅ OPTIMIZED API Functions
const fetchProfile = async (): Promise<{ user: ProfileData }> => {
  const response = await fetch('/api/profile', {
    headers: {
      'Cache-Control': 'public, max-age=300', // ✅ 5 minute browser cache
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`)
  }

  const result = await response.json()
  
  if (!result.user) {
    throw new Error('No user data returned')
  }
  
  return result
}

const updateProfile = async (data: UpdateProfileData): Promise<{ user: ProfileData }> => {
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
  
  if (!result.user) {
    throw new Error('No user data returned after update')
  }
  
  return result
}

const changePassword = async (data: ChangePasswordData): Promise<void> => {
  const response = await fetch('/api/profile/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to change password')
  }
}

const updatePreferences = async (data: ProfilePreferences): Promise<{ user: ProfileData }> => {
  const response = await fetch('/api/profile/preferences', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update preferences')
  }

  return response.json()
}

const uploadProfileImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to upload image')
  }

  return response.json()
}

// ✅ OPTIMIZED Main Profile Hook - MAJOR PERFORMANCE IMPROVEMENT
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes - profile data doesn't change often
    gcTime: 30 * 60 * 1000, // ✅ 30 minutes cache - profile is stable data
    refetchOnWindowFocus: false, // ✅ No unnecessary refetches - MAJOR PERFORMANCE BOOST
    refetchOnMount: false, // ✅ Use cache first - MAJOR PERFORMANCE BOOST
    retry: 1, // ✅ Faster error handling
    select: (data) => data.user, // ✅ Extract just the user data
    onError: (error: Error) => {
      console.error('Profile fetch error:', error)
      toast.error('Failed to load profile')
    },
  })
}

// ✅ OPTIMIZED Update Profile Mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (updateData) => {
      // ✅ Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['profile'] })

      // ✅ Snapshot the previous value
      const previousProfile = queryClient.getQueryData(['profile'])

      // ✅ Optimistically update profile - instant UI feedback
      queryClient.setQueryData(['profile'], (old: ProfileData | undefined) => {
        if (!old) return old
        return { ...old, ...updateData }
      })

      // ✅ Return context object with snapshot
      return { previousProfile }
    },
    onSuccess: (result) => {
      // ✅ Update with server response
      queryClient.setQueryData(['profile'], result.user)
      
      // ✅ Update other related caches
      queryClient.setQueryData(['users', 'single', result.user.id], { user: result.user })
      
      toast.success('Profile updated successfully! ✅', {
        description: 'Your changes have been saved.',
      })
    },
    onError: (error: Error, _, context) => {
      // ✅ Rollback optimistic update on error
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile)
      }
      
      console.error('Update profile error:', error)
      toast.error('Failed to update profile', {
        description: error.message,
      })
    },
    onSettled: () => {
      // ✅ Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

// ✅ NEW Change Password Mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully! 🔐', {
        description: 'Your password has been updated.',
      })
    },
    onError: (error: Error) => {
      console.error('Change password error:', error)
      toast.error('Failed to change password', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW Update Preferences Mutation
export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updatePreferences,
    onMutate: async (updateData) => {
      // ✅ Optimistic update for instant theme/preference changes
      await queryClient.cancelQueries({ queryKey: ['profile'] })
      const previousProfile = queryClient.getQueryData(['profile'])

      queryClient.setQueryData(['profile'], (old: ProfileData | undefined) => {
        if (!old) return old
        return { ...old, ...updateData }
      })

      return { previousProfile }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(['profile'], result.user)
      
      toast.success('Preferences updated! ⚙️', {
        description: 'Your settings have been saved.',
      })
    },
    onError: (error: Error, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile)
      }
      
      console.error('Update preferences error:', error)
      toast.error('Failed to update preferences', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW Profile Image Upload Mutation
export function useUploadProfileImage() {
  const queryClient = useQueryClient()
  const updateProfileMutation = useUpdateProfile()
  
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: async (result) => {
      // ✅ Automatically update profile with new image URL
      try {
        await updateProfileMutation.mutateAsync({ image: result.url })
        
        toast.success('Profile image updated! 📸', {
          description: 'Your new profile picture has been saved.',
        })
      } catch (error) {
        toast.error('Image uploaded but failed to update profile')
      }
    },
    onError: (error: Error) => {
      console.error('Upload image error:', error)
      toast.error('Failed to upload image', {
        description: error.message,
      })
    },
  })
}

// ✅ NEW Profile Activity Hook
export function useProfileActivity() {
  return useQuery({
    queryKey: ['profile', 'activity'],
    queryFn: async () => {
      const response = await fetch('/api/profile/activity', {
        headers: {
          'Cache-Control': 'public, max-age=180', // ✅ 3 minute cache for activity
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile activity')
      }
      
      return response.json()
    },
    staleTime: 3 * 60 * 1000, // ✅ 3 minutes - activity changes more frequently
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ NEW Profile Statistics Hook
export function useProfileStats() {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/profile/stats', {
        headers: {
          'Cache-Control': 'public, max-age=300', // ✅ 5 minute cache for stats
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile statistics')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // ✅ 5 minutes - stats don't change too often
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// ✅ BACKWARD COMPATIBILITY - Keep your existing interface
export interface UseProfileReturn {
  profile: ProfileData | null
  isLoading: boolean
  error: string | null
  updateProfile: (data: Partial<ProfileData>) => Promise<boolean>
  refetch: () => void
}

// ✅ COMPATIBILITY WRAPPER - Use this if you want to keep your exact same interface
export function useProfileLegacy(): UseProfileReturn {
  const query = useProfile()
  const updateMutation = useUpdateProfile()

  return {
    profile: query.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    updateProfile: async (data: Partial<ProfileData>) => {
      try {
        await updateMutation.mutateAsync(data as UpdateProfileData)
        return true
      } catch {
        return false
      }
    },
  }
}

// ✅ Utility functions for profile management
export const getProfileDisplayName = (profile: ProfileData): string => {
  if (profile.name) return profile.name
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`
  }
  if (profile.firstName) return profile.firstName
  return profile.email.split('@')[0]
}

export const getProfileInitials = (profile: ProfileData): string => {
  const displayName = getProfileDisplayName(profile)
  const words = displayName.split(' ')
  
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  
  return displayName.substring(0, 2).toUpperCase()
}

export const isProfileComplete = (profile: ProfileData): boolean => {
  const requiredFields = ['name', 'email', 'role', 'department']
  return requiredFields.every(field => profile[field as keyof ProfileData])
}

// ✅ Export types for convenience
export type { UpdateProfileData, ChangePasswordData, ProfilePreferences }