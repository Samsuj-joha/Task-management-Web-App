// // // src/contexts/profile-context.tsx
// // 'use client'

// // import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// // import { useSession } from 'next-auth/react'

// // interface ProfileData {
// //   firstName: string
// //   lastName: string
// //   email: string
// //   department: string
// //   employeeId: string
// //   phone: string
// //   location: string
// //   bio: string
// //   image: string
// // }

// // interface ProfileContextType {
// //   profile: ProfileData
// //   updateProfile: (data: Partial<ProfileData>) => void
// //   saveProfileToDatabase: (data: ProfileData) => Promise<boolean>
// //   loadProfileFromDatabase: () => Promise<void>
// //   getDisplayName: () => string
// //   getDisplayEmail: () => string
// //   getDisplayImage: () => string
// //   getInitials: () => string
// //   isLoading: boolean
// // }

// // const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// // export function ProfileProvider({ children }: { children: ReactNode }) {
// //   const { data: session } = useSession()
// //   const [isLoading, setIsLoading] = useState(false)
  
// //   // Initialize profile with session data or empty values
// //   const [profile, setProfile] = useState<ProfileData>({
// //     firstName: '',
// //     lastName: '',
// //     email: '',
// //     department: '',
// //     employeeId: '',
// //     phone: '',
// //     location: '',
// //     bio: '',
// //     image: ''
// //   })

// //   // Load profile from database when session is available
// //   useEffect(() => {
// //     if (session?.user?.id) {
// //       loadProfileFromDatabase()
// //     }
// //   }, [session])

// //   const loadProfileFromDatabase = async () => {
// //     if (!session?.user?.id) return

// //     setIsLoading(true)
// //     try {
// //       console.log('Loading profile from database...')
      
// //       const response = await fetch('/api/profile', {
// //         method: 'GET',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         }
// //       })

// //       if (response.ok) {
// //         const data = await response.json()
// //         console.log('Profile loaded from database:', data.profile)
        
// //         setProfile(data.profile)
        
// //         // Also save to localStorage as backup
// //         localStorage.setItem('taskflow-profile', JSON.stringify(data.profile))
// //       } else {
// //         console.warn('Failed to load profile from database, using session data')
        
// //         // Fallback to session data
// //         const sessionProfile = {
// //           firstName: session.user.name?.split(' ')[0] || '',
// //           lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
// //           email: session.user.email || '',
// //           department: '',
// //           employeeId: '',
// //           phone: '',
// //           location: '',
// //           bio: '',
// //           image: session.user.image || ''
// //         }
// //         setProfile(sessionProfile)
// //       }
// //     } catch (error) {
// //       console.error('Error loading profile from database:', error)
      
// //       // Fallback to localStorage then session
// //       const savedProfile = localStorage.getItem('taskflow-profile')
// //       if (savedProfile) {
// //         try {
// //           const parsedProfile = JSON.parse(savedProfile)
// //           setProfile(parsedProfile)
// //         } catch (parseError) {
// //           console.error('Error parsing saved profile:', parseError)
// //         }
// //       }
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const saveProfileToDatabase = async (data: ProfileData): Promise<boolean> => {
// //     if (!session?.user?.id) {
// //       console.error('No session available for saving profile')
// //       return false
// //     }

// //     try {
// //       console.log('Saving profile to database:', data)
      
// //       const response = await fetch('/api/profile', {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(data)
// //       })

// //       if (response.ok) {
// //         const result = await response.json()
// //         console.log('Profile saved to database successfully:', result.message)
        
// //         // Update local state with saved data
// //         setProfile(result.profile)
        
// //         // Update localStorage backup
// //         localStorage.setItem('taskflow-profile', JSON.stringify(result.profile))
        
// //         return true
// //       } else {
// //         const error = await response.json()
// //         console.error('Failed to save profile to database:', error)
// //         return false
// //       }
// //     } catch (error) {
// //       console.error('Error saving profile to database:', error)
// //       return false
// //     }
// //   }

// //   const updateProfile = (data: Partial<ProfileData>) => {
// //     const updatedProfile = { ...profile, ...data }
// //     setProfile(updatedProfile)
    
// //     // Save to localStorage immediately for local updates
// //     localStorage.setItem('taskflow-profile', JSON.stringify(updatedProfile))
    
// //     console.log('Profile updated locally:', updatedProfile)
// //   }

// //   const getDisplayName = () => {
// //     if (profile.firstName || profile.lastName) {
// //       return `${profile.firstName} ${profile.lastName}`.trim()
// //     }
// //     return session?.user?.name || 'User'
// //   }

// //   const getDisplayEmail = () => {
// //     return profile.email || session?.user?.email || 'user@example.com'
// //   }

// //   const getDisplayImage = () => {
// //     return profile.image || session?.user?.image || ''
// //   }

// //   const getInitials = () => {
// //     const name = getDisplayName()
// //     if (!name || name === 'User') return '??'
    
// //     return name
// //       .split(' ')
// //       .map(n => n[0])
// //       .join('')
// //       .toUpperCase()
// //       .slice(0, 2)
// //   }

// //   return (
// //     <ProfileContext.Provider
// //       value={{
// //         profile,
// //         updateProfile,
// //         saveProfileToDatabase,
// //         loadProfileFromDatabase,
// //         getDisplayName,
// //         getDisplayEmail,
// //         getDisplayImage,
// //         getInitials,
// //         isLoading
// //       }}
// //     >
// //       {children}
// //     </ProfileContext.Provider>
// //   )
// // }

// // export function useProfile() {
// //   const context = useContext(ProfileContext)
// //   if (context === undefined) {
// //     throw new Error('useProfile must be used within a ProfileProvider')
// //   }
// //   return context
// // }





// // src/contexts/profile-context.tsx
// 'use client'

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
// import { useSession } from 'next-auth/react'

// interface ProfileData {
//   id?: string
//   name?: string
//   firstName?: string
//   lastName?: string
//   email?: string
//   image?: string
//   role?: string
//   department?: string
//   employeeId?: string
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

// interface ProfileContextType {
//   profile: ProfileData | null
//   updateProfile: (data: Partial<ProfileData>) => void
//   saveProfileToDatabase: (data: ProfileData) => Promise<boolean>
//   loadProfileFromDatabase: () => Promise<void>
//   getDisplayName: () => string
//   getDisplayEmail: () => string
//   getDisplayImage: () => string
//   getInitials: () => string
//   isLoading: boolean
//   isAuthenticated: boolean
// }

// const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

// export function ProfileProvider({ children }: { children: ReactNode }) {
//   const { data: session, status } = useSession()
//   const [isLoading, setIsLoading] = useState(true)
//   const [profile, setProfile] = useState<ProfileData | null>(null)

//   // Load profile from database when session is available
//   useEffect(() => {
//     if (session?.user?.id) {
//       loadProfileFromDatabase()
//     } else if (status !== 'loading') {
//       setIsLoading(false)
//     }
//   }, [session, status])

//   const loadProfileFromDatabase = async () => {
//     if (!session?.user?.id) return

//     setIsLoading(true)
//     try {
//       console.log('Loading profile from database...')
      
//       const response = await fetch('/api/profile', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       })

//       if (response.ok) {
//         const data = await response.json()
//         console.log('Profile loaded from database:', data)
        
//         // The API returns { user: {...} }, so access data.user
//         if (data.user) {
//           setProfile(data.user)
//           console.log('Profile set successfully:', data.user)
//         } else {
//           console.warn('No user data in API response')
//           setProfile(createFallbackProfile())
//         }
//       } else {
//         console.warn('Failed to load profile from database, using session data')
//         setProfile(createFallbackProfile())
//       }
//     } catch (error) {
//       console.error('Error loading profile from database:', error)
//       setProfile(createFallbackProfile())
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const createFallbackProfile = (): ProfileData => {
//     return {
//       id: session?.user?.id || '',
//       firstName: session?.user?.name?.split(' ')[0] || '',
//       lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
//       name: session?.user?.name || '',
//       email: session?.user?.email || '',
//       image: session?.user?.image || '',
//       department: '',
//       employeeId: '',
//       phone: '',
//       location: '',
//       bio: '',
//       skills: [],
//       role: 'EMPLOYEE',
//       status: 'ACTIVE',
//       isActive: true
//     }
//   }

//   const saveProfileToDatabase = async (data: ProfileData): Promise<boolean> => {
//     if (!session?.user?.id) {
//       console.error('No session available for saving profile')
//       return false
//     }

//     try {
//       console.log('Saving profile to database:', data)
      
//       const response = await fetch('/api/profile', {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data)
//       })

//       if (response.ok) {
//         const result = await response.json()
//         console.log('Profile saved to database successfully:', result.message)
        
//         // Update local state with saved data
//         if (result.user) {
//           setProfile(result.user)
//         }
        
//         return true
//       } else {
//         const error = await response.json()
//         console.error('Failed to save profile to database:', error)
//         return false
//       }
//     } catch (error) {
//       console.error('Error saving profile to database:', error)
//       return false
//     }
//   }

//   const updateProfile = (data: Partial<ProfileData>) => {
//     if (!profile) return
    
//     const updatedProfile = { ...profile, ...data }
//     setProfile(updatedProfile)
//     console.log('Profile updated locally:', updatedProfile)
//   }

//   const getDisplayName = (): string => {
//     // Add null checks and fallbacks
//     if (!profile) {
//       return session?.user?.name || 'User'
//     }

//     if (profile.firstName || profile.lastName) {
//       const firstName = profile.firstName || ''
//       const lastName = profile.lastName || ''
//       return `${firstName} ${lastName}`.trim()
//     }
    
//     if (profile.name) {
//       return profile.name
//     }
    
//     return session?.user?.name || 'User'
//   }

//   const getDisplayEmail = (): string => {
//     return profile?.email || session?.user?.email || 'user@example.com'
//   }

//   const getDisplayImage = (): string => {
//     return profile?.image || session?.user?.image || ''
//   }

//   const getInitials = (): string => {
//     const name = getDisplayName()
//     if (!name || name === 'User') return '??'
    
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2)
//   }

//   return (
//     <ProfileContext.Provider
//       value={{
//         profile,
//         updateProfile,
//         saveProfileToDatabase,
//         loadProfileFromDatabase,
//         getDisplayName,
//         getDisplayEmail,
//         getDisplayImage,
//         getInitials,
//         isLoading,
//         isAuthenticated: !!session?.user
//       }}
//     >
//       {children}
//     </ProfileContext.Provider>
//   )
// }

// export function useProfile() {
//   const context = useContext(ProfileContext)
//   if (context === undefined) {
//     throw new Error('useProfile must be used within a ProfileProvider')
//   }
//   return context
// }



// src/contexts/profile-context.tsx (UPDATED VERSION)
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface ProfileData {
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  role?: string
  department?: string
  employeeId?: string
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

interface ProfileContextType {
  profile: ProfileData | null
  updateProfile: (data: Partial<ProfileData>) => void
  saveProfileToDatabase: (data: ProfileData) => Promise<boolean>
  loadProfileFromDatabase: () => Promise<void>
  getDisplayName: () => string
  getDisplayEmail: () => string
  getDisplayImage: () => string
  getInitials: () => string
  isLoading: boolean
  isAuthenticated: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)

  // Load profile from database when session is available
  useEffect(() => {
    if (session?.user?.id) {
      loadProfileFromDatabase()
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session, status])

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('Profile context received update event:', event.detail)
      if (event.detail?.user) {
        setProfile(event.detail.user)
      } else {
        // Refetch profile if no user data in event
        loadProfileFromDatabase()
      }
    }

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener)
    }
  }, [])

  const loadProfileFromDatabase = async () => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      console.log('Loading profile from database...')
      
      const response = await fetch('/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Profile loaded from database:', data)
        
        // The API returns { user: {...} }, so access data.user
        if (data.user) {
          setProfile(data.user)
          console.log('Profile set successfully:', data.user)
        } else {
          console.warn('No user data in API response')
          setProfile(createFallbackProfile())
        }
      } else {
        console.warn('Failed to load profile from database, using session data')
        setProfile(createFallbackProfile())
      }
    } catch (error) {
      console.error('Error loading profile from database:', error)
      setProfile(createFallbackProfile())
    } finally {
      setIsLoading(false)
    }
  }

  const createFallbackProfile = (): ProfileData => {
    return {
      id: session?.user?.id || '',
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      image: session?.user?.image || '',
      department: '',
      employeeId: '',
      phone: '',
      location: '',
      bio: '',
      skills: [],
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      isActive: true
    }
  }

  const saveProfileToDatabase = async (data: ProfileData): Promise<boolean> => {
    if (!session?.user?.id) {
      console.error('No session available for saving profile')
      return false
    }

    try {
      console.log('Saving profile to database:', data)
      
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Profile saved to database successfully:', result.message)
        
        // Update local state with saved data
        if (result.user) {
          setProfile(result.user)
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('profileUpdated', { 
            detail: { user: result.user } 
          }))
        }
        
        return true
      } else {
        const error = await response.json()
        console.error('Failed to save profile to database:', error)
        return false
      }
    } catch (error) {
      console.error('Error saving profile to database:', error)
      return false
    }
  }

  const updateProfile = (data: Partial<ProfileData>) => {
    if (!profile) return
    
    const updatedProfile = { ...profile, ...data }
    setProfile(updatedProfile)
    console.log('Profile updated locally:', updatedProfile)
  }

  const getDisplayName = (): string => {
    // Add null checks and fallbacks
    if (!profile) {
      return session?.user?.name || 'User'
    }

    if (profile.firstName || profile.lastName) {
      const firstName = profile.firstName || ''
      const lastName = profile.lastName || ''
      return `${firstName} ${lastName}`.trim()
    }
    
    if (profile.name) {
      return profile.name
    }
    
    return session?.user?.name || 'User'
  }

  const getDisplayEmail = (): string => {
    return profile?.email || session?.user?.email || 'user@example.com'
  }

  const getDisplayImage = (): string => {
    return profile?.image || session?.user?.image || ''
  }

  const getInitials = (): string => {
    const name = getDisplayName()
    if (!name || name === 'User') return '??'
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        saveProfileToDatabase,
        loadProfileFromDatabase,
        getDisplayName,
        getDisplayEmail,
        getDisplayImage,
        getInitials,
        isLoading,
        isAuthenticated: !!session?.user
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}