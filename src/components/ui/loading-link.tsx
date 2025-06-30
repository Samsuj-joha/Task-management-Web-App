// src/components/ui/loading-link.tsx
'use client'

import Link from 'next/link'
import { useNavigationLoading } from '@/components/providers/navigation-loading-provider'
import { ReactNode } from 'react'

interface LoadingLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
  loadingMessage?: string
  [key: string]: any
}

export function LoadingLink({ 
  href, 
  children, 
  className, 
  onClick, 
  loadingMessage,
  ...props 
}: LoadingLinkProps) {
  const { startLoading, setLoadingMessage } = useNavigationLoading()

  const handleClick = () => {
    if (loadingMessage) {
      setLoadingMessage(loadingMessage)
    }
    startLoading()
    onClick?.()
  }

  return (
    <Link 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  )
}