// src/app/(auth)/forgot-password/loading.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Workflow, Building2 } from 'lucide-react'

export default function ForgotPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <Workflow className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TaskFlow</h1>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Paragon Group</span>
              </div>
            </div>
          </div>
          <Skeleton className="h-4 w-52 mx-auto" />
        </div>

        {/* Forgot Password Form Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Field Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-56" />
            </div>

            {/* Send Instructions Button */}
            <Skeleton className="h-10 w-full" />

            {/* Back to Sign In Link */}
            <div className="flex items-center justify-center pt-4">
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Additional Help Card Skeleton */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-3 w-56 mx-auto" />
              <Skeleton className="h-3 w-48 mx-auto" />
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Skeleton */}
        <div className="text-center mt-8 space-y-2">
          <Skeleton className="h-3 w-48 mx-auto" />
          <div className="flex items-center justify-center space-x-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}