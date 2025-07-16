// src/components/layout/layout.tsx - UPDATED VERSION
'use client'

import { useSession } from 'next-auth/react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { Toaster } from 'sonner'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession()

  // Don't render layout components for unauthenticated users on auth pages
  const isAuthPage = typeof window !== 'undefined' && 
    (window.location.pathname === '/login' || 
     window.location.pathname === '/register' ||
     window.location.pathname === '/auth/signin' ||
     window.location.pathname === '/auth/signup')

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session && isAuthPage) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        <Toaster position="top-right" />
      </ThemeProvider>
    )
  }

  if (!session) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="main-content">
            {children}
          </main>
        </div>
        <Toaster position="top-right" />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="layout-container min-h-screen bg-background">
          {/* Fixed Header */}
          <Header />
          
          <div className="flex flex-1">
            {/* Sidebar - positioned below fixed header */}
            <Sidebar />
            
            {/* Main Content Area */}
            <main className="flex-1 main-content overflow-auto">
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              marginTop: '80px', // Add margin to avoid header overlap
            }
          }}
        />
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default Layout