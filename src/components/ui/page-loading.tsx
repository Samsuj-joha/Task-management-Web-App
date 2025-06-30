// src/components/ui/page-loading.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface PageLoadingProps {
  isLoading?: boolean
  message?: string
}

export function PageLoading({ isLoading = true, message = "Loading..." }: PageLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(message)

  useEffect(() => {
    if (!isLoading) return

    const messages = [
      "Loading...",
      "Fetching data...",
      "Almost there...",
      "Preparing content..."
    ]

    let messageIndex = 0
    let progressValue = 0

    const interval = setInterval(() => {
      progressValue += Math.random() * 15 + 5
      
      if (progressValue >= 100) {
        progressValue = 100
        setCurrentMessage("Complete!")
        clearInterval(interval)
      } else {
        if (progressValue > 25 * (messageIndex + 1) && messageIndex < messages.length - 1) {
          messageIndex++
          setCurrentMessage(messages[messageIndex])
        }
      }
      
      setProgress(progressValue)
    }, 200)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border rounded-lg shadow-lg p-8 w-full max-w-md mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Logo */}
          <div className="relative">
            <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-primary-foreground font-bold text-xl">TF</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-transparent rounded-lg animate-ping" />
          </div>

          {/* Loading Spinner */}
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">{currentMessage}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>TaskFlow</span>
              <span>{Math.round(progress)}%</span>
            </div>
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

// Navigation Loading Hook
export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return { isLoading, startLoading, stopLoading }
}