// File 1: src/lib/presence-manager.ts
// Core presence tracking system
'use client'

interface UserPresence {
  userId: string
  name: string
  email: string
  image?: string
  role: string
  department?: string
  status: 'ONLINE' | 'AWAY' | 'OFFLINE'
  lastSeen: Date
  currentPage?: string
  isActive: boolean
}

class PresenceManagerClass {
  private users = new Map<string, UserPresence>()
  private listeners = new Set<(users: UserPresence[]) => void>()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private currentUser: UserPresence | null = null
  private isInitialized = false

  // Initialize presence tracking for current user
  async initialize(user: {
    id: string
    name: string
    email: string
    image?: string
    role: string
    department?: string
  }) {
    if (this.isInitialized) return

    console.log('🟢 Initializing presence for:', user.name)
    
    this.currentUser = {
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      department: user.department,
      status: 'ONLINE',
      lastSeen: new Date(),
      currentPage: window.location.pathname,
      isActive: true
    }

    // Add current user to presence
    this.users.set(user.id, this.currentUser)
    
    // Start heartbeat
    this.startHeartbeat()
    
    // Track page changes
    this.trackPageChanges()
    
    // Track user activity
    this.trackUserActivity()
    
    // Fetch other users' presence
    await this.fetchPresenceData()
    
    // Set user as online in database
    await this.updatePresenceInDB('ONLINE')
    
    this.isInitialized = true
    this.notifyListeners()
    
    console.log('✅ Presence tracking initialized')
  }

  // Start periodic heartbeat to maintain presence
  private startHeartbeat() {
    // Clear existing interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    // Send heartbeat every 30 seconds
    this.heartbeatInterval = setInterval(async () => {
      if (this.currentUser) {
        this.currentUser.lastSeen = new Date()
        this.currentUser.currentPage = window.location.pathname
        
        // Update in memory
        this.users.set(this.currentUser.userId, { ...this.currentUser })
        
        // Update in database
        await this.sendHeartbeat()
        
        // Fetch latest presence data
        await this.fetchPresenceData()
        
        this.notifyListeners()
      }
    }, 30000) // 30 seconds
  }

  // Track page navigation
  private trackPageChanges() {
    // Track route changes in Next.js
    let currentPath = window.location.pathname

    const checkPageChange = () => {
      const newPath = window.location.pathname
      if (newPath !== currentPath && this.currentUser) {
        currentPath = newPath
        this.currentUser.currentPage = newPath
        this.currentUser.lastSeen = new Date()
        this.users.set(this.currentUser.userId, { ...this.currentUser })
        this.notifyListeners()
      }
    }

    // Check for route changes every 2 seconds
    setInterval(checkPageChange, 2000)
  }

  // Track user activity (mouse, keyboard, scroll)
  private trackUserActivity() {
    let activityTimeout: NodeJS.Timeout | null = null

    const setUserActive = () => {
      if (this.currentUser) {
        this.currentUser.isActive = true
        this.currentUser.status = 'ONLINE'
        this.currentUser.lastSeen = new Date()
        this.users.set(this.currentUser.userId, { ...this.currentUser })
        this.notifyListeners()
      }

      // Set user as away after 5 minutes of inactivity
      if (activityTimeout) clearTimeout(activityTimeout)
      activityTimeout = setTimeout(() => {
        if (this.currentUser) {
          this.currentUser.isActive = false
          this.currentUser.status = 'AWAY'
          this.users.set(this.currentUser.userId, { ...this.currentUser })
          this.updatePresenceInDB('AWAY')
          this.notifyListeners()
        }
      }, 5 * 60 * 1000) // 5 minutes
    }

    // Listen for activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      document.addEventListener(event, setUserActive, { passive: true })
    })

    // Set initial activity
    setUserActive()
  }

  // Fetch presence data from server
  private async fetchPresenceData() {
    try {
      const response = await fetch('/api/presence')
      if (response.ok) {
        const data = await response.json()
        
        // Update users map with server data
        data.users.forEach((user: any) => {
          const presence: UserPresence = {
            userId: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            department: user.department,
            status: this.determineStatus(user.lastActive),
            lastSeen: new Date(user.lastActive || user.updatedAt),
            isActive: this.isUserActive(user.lastActive)
          }
          
          this.users.set(user.id, presence)
        })
        
        this.notifyListeners()
      }
    } catch (error) {
      console.error('Error fetching presence data:', error)
    }
  }

  // Send heartbeat to server
  private async sendHeartbeat() {
    try {
      await fetch('/api/presence/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPage: this.currentUser?.currentPage,
          isActive: this.currentUser?.isActive
        })
      })
    } catch (error) {
      console.error('Error sending heartbeat:', error)
    }
  }

  // Update presence status in database
  private async updatePresenceInDB(status: 'ONLINE' | 'AWAY' | 'OFFLINE') {
    try {
      await fetch('/api/presence/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
    } catch (error) {
      console.error('Error updating presence status:', error)
    }
  }

  // Determine user status based on last activity
  private determineStatus(lastActive: string | null): 'ONLINE' | 'AWAY' | 'OFFLINE' {
    if (!lastActive) return 'OFFLINE'
    
    const lastActiveDate = new Date(lastActive)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
    
    if (diffMinutes < 2) return 'ONLINE'
    if (diffMinutes < 10) return 'AWAY'
    return 'OFFLINE'
  }

  // Check if user is currently active
  private isUserActive(lastActive: string | null): boolean {
    if (!lastActive) return false
    
    const lastActiveDate = new Date(lastActive)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
    
    return diffMinutes < 5 // Active within last 5 minutes
  }

  // Get all users presence
  getUsers(): UserPresence[] {
    return Array.from(this.users.values()).sort((a, b) => {
      // Sort by status first (online, away, offline), then by name
      const statusOrder = { ONLINE: 0, AWAY: 1, OFFLINE: 2 }
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return a.name.localeCompare(b.name)
    })
  }

  // Get online users count
  getOnlineCount(): number {
    return Array.from(this.users.values()).filter(u => u.status === 'ONLINE').length
  }

  // Get users by status
  getUsersByStatus(status: 'ONLINE' | 'AWAY' | 'OFFLINE'): UserPresence[] {
    return Array.from(this.users.values()).filter(u => u.status === status)
  }

  // Subscribe to presence changes
  subscribe(listener: (users: UserPresence[]) => void) {
    this.listeners.add(listener)
    
    // Send initial data
    listener(this.getUsers())
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners
  private notifyListeners() {
    const users = this.getUsers()
    this.listeners.forEach(listener => {
      try {
        listener(users)
      } catch (error) {
        console.error('Error in presence listener:', error)
      }
    })
  }

  // Set user as offline (call on page unload)
  async setOffline() {
    if (this.currentUser) {
      this.currentUser.status = 'OFFLINE'
      this.users.set(this.currentUser.userId, { ...this.currentUser })
      await this.updatePresenceInDB('OFFLINE')
      this.notifyListeners()
    }

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    console.log('🔴 User set offline')
  }

  // Get current user presence
  getCurrentUser(): UserPresence | null {
    return this.currentUser
  }

  // Cleanup
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }
    this.listeners.clear()
    this.users.clear()
    this.isInitialized = false
    console.log('🧹 Presence manager cleaned up')
  }
}

// Global singleton instance
export const PresenceManager = new PresenceManagerClass()

// React hook for using presence
import { useState, useEffect } from 'react'

export function usePresence() {
  const [users, setUsers] = useState<UserPresence[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
    
    // Subscribe to presence changes
    const unsubscribe = PresenceManager.subscribe((updatedUsers) => {
      setUsers(updatedUsers)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  return {
    users,
    isLoading,
    onlineCount: PresenceManager.getOnlineCount(),
    onlineUsers: PresenceManager.getUsersByStatus('ONLINE'),
    awayUsers: PresenceManager.getUsersByStatus('AWAY'),
    offlineUsers: PresenceManager.getUsersByStatus('OFFLINE'),
    currentUser: PresenceManager.getCurrentUser()
  }
}
