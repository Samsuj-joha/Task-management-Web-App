// lib/loading-manager.ts - CREATE THIS FILE
type LoadingState = {
  key: string
  message: string
  timestamp: number
}

class LoadingManagerClass {
  private loadingStates = new Map<string, LoadingState>()
  private listeners = new Set<(isLoading: boolean, message: string) => void>()
  private timeouts = new Map<string, NodeJS.Timeout>()

  // Start loading with auto-timeout
  start(key: string, message = 'Loading...', timeoutMs = 8000) {
    // Clear existing timeout for this key
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!)
    }

    console.log(`🔄 Loading started: ${key} - ${message}`)
    
    this.loadingStates.set(key, {
      key,
      message,
      timestamp: Date.now()
    })

    // Auto-stop loading after timeout
    const timeout = setTimeout(() => {
      console.log(`⏰ Loading timeout: ${key}`)
      this.stop(key)
    }, timeoutMs)
    
    this.timeouts.set(key, timeout)
    this.notify()
  }

  // Stop specific loading
  stop(key: string) {
    const state = this.loadingStates.get(key)
    if (state) {
      const duration = Date.now() - state.timestamp
      console.log(`✅ Loading completed: ${key} in ${duration}ms`)
    }

    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key)!)
      this.timeouts.delete(key)
    }
    
    this.loadingStates.delete(key)
    this.notify()
  }

  // Stop all loading
  stopAll() {
    console.log(`🛑 Stopping all loading states`)
    this.timeouts.forEach(timeout => clearTimeout(timeout))
    this.timeouts.clear()
    this.loadingStates.clear()
    this.notify()
  }

  // Check if any loading is active
  isLoading(): boolean {
    return this.loadingStates.size > 0
  }

  // Get current message (most recent)
  getCurrentMessage(): string {
    if (this.loadingStates.size === 0) return ''
    
    const states = Array.from(this.loadingStates.values())
    const latest = states.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    )
    
    return latest.message
  }

  // Get loading count for debugging
  getActiveCount(): number {
    return this.loadingStates.size
  }

  // Subscribe to loading changes
  subscribe(listener: (isLoading: boolean, message: string) => void) {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Notify all listeners
  private notify() {
    const isLoading = this.isLoading()
    const message = this.getCurrentMessage()
    
    this.listeners.forEach(listener => {
      try {
        listener(isLoading, message)
      } catch (error) {
        console.error('Loading manager listener error:', error)
      }
    })
  }

  // Debug info
  getDebugInfo() {
    return {
      activeStates: Array.from(this.loadingStates.values()),
      listenerCount: this.listeners.size,
      timeoutCount: this.timeouts.size
    }
  }
}

// Global singleton instance
export const LoadingManager = new LoadingManagerClass()

// React hook for using loading manager
import { useState, useEffect } from 'react'

export function useLoadingManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Initial state
    setIsLoading(LoadingManager.isLoading())
    setMessage(LoadingManager.getCurrentMessage())

    // Subscribe to changes
    const unsubscribe = LoadingManager.subscribe((loading, msg) => {
      setIsLoading(loading)
      setMessage(msg)
    })

    return unsubscribe
  }, [])

  return {
    isLoading,
    message,
    activeCount: LoadingManager.getActiveCount(),
    start: LoadingManager.start.bind(LoadingManager),
    stop: LoadingManager.stop.bind(LoadingManager),
    stopAll: LoadingManager.stopAll.bind(LoadingManager)
  }
}

// Helper for API calls with automatic loading
export async function withLoading<T>(
  key: string, 
  promise: Promise<T>, 
  message = 'Loading...'
): Promise<T> {
  try {
    LoadingManager.start(key, message)
    const result = await promise
    LoadingManager.stop(key)
    return result
  } catch (error) {
    LoadingManager.stop(key)
    throw error
  }
}