// src/components/ui/simple-loading.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

// Global loading state
let globalLoadingState = {
  isLoading: false,
  message: 'Loading...',
  listeners: new Set<() => void>()
}

// Simple loading manager without context
export const LoadingManager = {
  startLoading: (message = 'Loading...') => {
    globalLoadingState.isLoading = true
    globalLoadingState.message = message
    globalLoadingState.listeners.forEach(listener => listener())
  },
  
  stopLoading: () => {
    globalLoadingState.isLoading = false
    globalLoadingState.listeners.forEach(listener => listener())
  },
  
  subscribe: (listener: () => void) => {
    globalLoadingState.listeners.add(listener)
    return () => globalLoadingState.listeners.delete(listener)
  },
  
  getState: () => ({ ...globalLoadingState })
}

// Simple Loading Component
export function SimplePageLoading() {
  const [state, setState] = useState(globalLoadingState)
  const pathname = usePathname()

  // Subscribe to loading state changes
  useEffect(() => {
    const unsubscribe = LoadingManager.subscribe(() => {
      setState({ ...globalLoadingState })
    })
    return unsubscribe
  }, [])

  // Auto-stop loading when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      LoadingManager.stopLoading()
    }, 500)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!state.isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-lg p-8 w-full max-w-md mx-4 animate-in fade-in duration-200">
        <div className="flex flex-col items-center space-y-6">


          {/* Loading Spinner */}
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">{state.message}</span>
          </div>

          {/* Loading Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>


        </div>
      </div>
    </div>
  )
}

// Simple Loading Link Component
interface SimpleLoadingLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
  loadingMessage?: string
  [key: string]: any
}

export function SimpleLoadingLink({ 
  href, 
  children, 
  className, 
  onClick, 
  loadingMessage = 'Loading...',
  ...props 
}: SimpleLoadingLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    LoadingManager.startLoading(loadingMessage)
    
    // Call custom onClick if provided
    onClick?.()
    
    // Navigate after a brief delay to show loading
    setTimeout(() => {
      router.push(href)
    }, 100)
  }

  return (
    <a 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  )
}

// Hook for manual loading control
export function useSimpleLoading() {
  const [state, setState] = useState(globalLoadingState)

  useEffect(() => {
    const unsubscribe = LoadingManager.subscribe(() => {
      setState({ ...globalLoadingState })
    })
    return unsubscribe
  }, [])

  return {
    isLoading: state.isLoading,
    startLoading: LoadingManager.startLoading,
    stopLoading: LoadingManager.stopLoading,
  }
}