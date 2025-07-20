// src/hooks/use-activity-tracker.ts - Track user activity
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useActivityTracker() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    // Update user's last active time immediately
    const updateActivity = async () => {
      try {
        await fetch('/api/users/active', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.error('Failed to update activity:', error)
      }
    }

    // Update activity on mount
    updateActivity()

    // Update activity every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000)

    // Update activity on user interaction
    const handleUserActivity = () => {
      updateActivity()
    }

    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    let activityTimeout: NodeJS.Timeout
    const throttledActivity = () => {
      clearTimeout(activityTimeout)
      activityTimeout = setTimeout(handleUserActivity, 30000) // Throttle to every 30 seconds
    }

    events.forEach(event => {
      document.addEventListener(event, throttledActivity, { passive: true })
    })

    // Cleanup
    return () => {
      clearInterval(interval)
      clearTimeout(activityTimeout)
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity)
      })
    }
  }, [session])
}

// Add this to your main layout or dashboard to track activity
// Usage: useActivityTracker() - call this hook in your main layout