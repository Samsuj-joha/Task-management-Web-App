// src/app/(auth)/layout.tsx
import { ThemeProvider } from '@/contexts/theme-context'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="taskflow-ui-theme">
      <div className="min-h-screen">
        {children}
      </div>
    </ThemeProvider>
  )
}