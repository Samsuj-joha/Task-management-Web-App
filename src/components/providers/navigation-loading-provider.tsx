// src/components/providers/navigation-loading-provider.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PageLoading } from '@/components/ui/page-loading'

interface NavigationLoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  setLoadingMessage: (message: string) => void
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | null>(null)

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext)
  if (!context) {
    throw new Error('useNavigationLoading must be used within NavigationLoadingProvider')
  }
  return context
}

interface NavigationLoadingProviderProps {
  children: React.ReactNode
}

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Auto-stop loading when route changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) // Small delay to ensure page has loaded

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  const startLoading = () => {
    setIsLoading(true)
    setLoadingMessage('Loading...')
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  const contextValue = {
    isLoading,
    startLoading,
    stopLoading,
    setLoadingMessage,
  }

  return (
    <NavigationLoadingContext.Provider value={contextValue}>
      {children}
      <PageLoading isLoading={isLoading} message={loadingMessage} />
    </NavigationLoadingContext.Provider>
  )
}