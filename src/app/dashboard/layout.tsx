

// // src/app/dashboard/layout.tsx
// 'use client'

// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { useEffect } from 'react'
// import { Header } from '@/components/layout/header'
// import { Sidebar } from '@/components/layout/sidebar'
// import { Footer } from '@/components/layout/footer'
// import { SimplePageLoading } from '@/components/ui/simple-loading' // ← Add this import
// import { ThemeProvider } from '@/contexts/theme-context'
// import { SidebarProvider } from '@/contexts/sidebar-context'
// import { ProfileProvider } from '@/contexts/profile-context'
// import { Skeleton } from '@/components/ui/skeleton'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const { data: session, status } = useSession()
//   const router = useRouter()

//   useEffect(() => {
//     if (status === 'loading') return // Still loading

//     if (status === 'unauthenticated') {
//       router.push('/login')
//       return
//     }
//   }, [status, router])

//   // Show loading while checking authentication
//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen bg-background flex flex-col">
//         <div className="h-16 border-b flex items-center px-4">
//           <Skeleton className="h-8 w-8 rounded-lg" />
//           <Skeleton className="h-6 w-24 ml-2" />
//         </div>
//         <div className="flex flex-1">
//           <div className="w-64 border-r p-4 space-y-4">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <Skeleton key={i} className="h-10 w-full" />
//             ))}
//           </div>
//           <div className="flex-1 p-6 space-y-6">
//             <Skeleton className="h-8 w-48" />
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {Array.from({ length: 4 }).map((_, i) => (
//                 <Skeleton key={i} className="h-24 w-full" />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Redirect if not authenticated
//   if (status === 'unauthenticated') {
//     return null // Will redirect in useEffect
//   }

//   // Render dashboard if authenticated
//   return (
//     <ThemeProvider defaultTheme="system" storageKey="taskflow-ui-theme">
//       <ProfileProvider>
//         <SidebarProvider>
//           <div className="min-h-screen bg-background flex flex-col">
//             {/* Header */}
//             <Header />
            
//             <div className="flex flex-1">
//               {/* Sidebar */}
//               <Sidebar />
              
//               {/* Main content */}
//               <main className="flex-1 flex flex-col min-w-0">
//                 {/* Page content */}
//                 <div className="flex-1 p-4 md:p-6 lg:p-8">
//                   {children}
//                 </div>
                
//                 {/* Footer */}
//                 <Footer />
//               </main>
//             </div>
//           </div>
          
//           {/* Add the loading component here - it will overlay when needed */}
//           <SimplePageLoading />
//         </SidebarProvider>
//       </ProfileProvider>
//     </ThemeProvider>
//   )
// }




// File 8: Update src/app/dashboard/layout.tsx
// Add presence provider to dashboard layout
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Footer } from '@/components/layout/footer'
import { SimplePageLoading } from '@/components/ui/simple-loading'
import { PresenceProvider } from '@/components/presence/presence-provider' // ADD THIS
import { ThemeProvider } from '@/contexts/theme-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { ProfileProvider } from '@/contexts/profile-context'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  // Show loading skeleton while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="h-16 border-b flex items-center px-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-24 ml-2" />
        </div>
        <div className="flex flex-1">
          <div className="w-64 border-r p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <ProfileProvider>
          <PresenceProvider> {/* ADD THIS: Wrap everything in PresenceProvider */}
            <div className="min-h-screen bg-background flex flex-col">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 overflow-auto">
                  {children}
                </main>
              </div>
              <Footer />
              
              {/* Global loading spinner */}
              <SimplePageLoading />
            </div>
          </PresenceProvider> {/* END: PresenceProvider */}
        </ProfileProvider>
      </SidebarProvider>
    </ThemeProvider>
  )
}