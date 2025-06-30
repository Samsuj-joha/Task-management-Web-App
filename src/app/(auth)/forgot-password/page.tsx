// src/app/(auth)/forgot-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Workflow, 
  Mail, 
  ArrowLeft,
  Building2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Send
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo purposes, show success
      console.log('Password reset request for:', email)
      setIsSuccess(true)
    } catch (err) {
      setError('Failed to send reset email. Please try again or contact IT support.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
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
          </div>

          {/* Success Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We've sent password reset instructions to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>{email}</strong>
                  <br />
                  If this email exists in our system, you'll receive reset instructions within a few minutes.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Didn't receive the email? Check your spam folder.</p>
                <p>If you still don't see it, contact IT support for assistance.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsSuccess(false)
                  setEmail('')
                }}
              >
                Try Different Email
              </Button>
            </CardFooter>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-muted-foreground">
            <p>© 2025 Paragon Group. Internal Use Only.</p>
            <div className="flex items-center justify-center space-x-4 mt-2">
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground">Terms of Use</Link>
              <Link href="#" className="hover:text-foreground">IT Support</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <p className="text-muted-foreground">
            Reset your password to regain access
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Forgot Password?</CardTitle>
            <CardDescription>
              Enter your work email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Work Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@paragongroup.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the same email address you use to sign in to TaskFlow
                </p>
              </div>

              {/* Send Instructions Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending instructions...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reset Instructions
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="flex items-center justify-center w-full">
              <Link 
                href="/login" 
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Help */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-medium">Need Additional Help?</h4>
              <p className="text-xs text-muted-foreground">
                If you're having trouble accessing your account, contact IT support for immediate assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="mr-2 h-3 w-3" />
                  Email IT Support
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Send className="mr-2 h-3 w-3" />
                  Call Help Desk
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>© 2025 Paragon Group. Internal Use Only.</p>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Use</Link>
            <Link href="#" className="hover:text-foreground">IT Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}