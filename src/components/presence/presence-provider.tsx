// File 6: src/components/presence/presence-provider.tsx
// Provider component to initialize presence tracking
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PresenceManager } from '@/lib/presence-manager'

interface PresenceProviderProps {
  children: React.ReactNode
}

export function PresenceProvider({ children }: PresenceProviderProps) {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      // Initialize presence tracking
      PresenceManager.initialize({
        id: session.user.id!,
        name: session.user.name || session.user.email || 'Unknown User',
        email: session.user.email!,
        image: session.user.image || undefined,
        // @ts-ignore - role might exist on user object
        role: session.user.role || 'USER',
        // @ts-ignore - department might exist on user object  
        department: session.user.department || undefined
      }).catch(console.error)

      // Set user offline when page unloads
      const handleBeforeUnload = () => {
        PresenceManager.setOffline()
      }

      const handleVisibilityChange = () => {
        if (document.hidden) {
          // Page is hidden, user might be away
          setTimeout(() => {
            if (document.hidden) {
              PresenceManager.setOffline()
            }
          }, 60000) // 1 minute delay
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        PresenceManager.cleanup()
      }
    }
  }, [session])

  return <>{children}</>
}