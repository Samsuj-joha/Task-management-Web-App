// src/components/layout/footer.tsx
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Heart, Workflow } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                  <Workflow className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">TaskFlow</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The ultimate task management solution for individuals and teams who want to get things done efficiently.
              </p>
              <Badge variant="secondary" className="text-xs">
                Version 1.0.0
              </Badge>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/dashboard/tasks" className="hover:text-foreground transition-colors">
                    Tasks
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/projects" className="hover:text-foreground transition-colors">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/calendar" className="hover:text-foreground transition-colors">
                    Calendar
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/analytics" className="hover:text-foreground transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-foreground transition-colors">
                    Send Feedback
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-foreground transition-colors">
                    System Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="font-semibold mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/dashboard/settings" className="hover:text-foreground transition-colors">
                    Settings
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings/profile" className="hover:text-foreground transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom footer */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span>© 2025 TaskFlow. Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for productivity enthusiasts.</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}