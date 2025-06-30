// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  Users, 
  BarChart3, 
  Calendar, 
  Zap,
  ArrowRight,
  Star,
  Target,
  Workflow,
  Building2,
  Shield,
  TrendingUp,
  ChevronUp,
  Menu,
  X
} from 'lucide-react'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollProgress = typeof window !== 'undefined' 
    ? Math.min((scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrollY > 50 ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'
      }`}>
        {/* Scroll Progress Bar */}
        {mounted && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300" 
               style={{ width: `${scrollProgress}%` }} />
        )}
        
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Workflow className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TaskFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Paragon Group</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#departments" className="text-muted-foreground hover:text-foreground transition-colors">
              Departments
            </Link>
            <Link href="#support" className="text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
          </nav>
          
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <Link 
                  href="#features" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  href="#departments" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Departments
                </Link>
                <Link 
                  href="#support" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
              </nav>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              🏢 Internal Tool - Paragon Group
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Streamline Your Work,
              <br />
              Boost Team Productivity
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              TaskFlow is Paragon Group's comprehensive task management platform. 
              Designed for our teams to collaborate efficiently, track projects, and achieve organizational goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/register" className="flex items-center">
                  Join TaskFlow
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link href="/login">Explore Dashboard</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Available to all Paragon Group employees • Secure internal platform
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for Paragon Group's Success
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tailored features designed to enhance productivity across all departments 
                and support our company's growth and collaboration goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Task Management</CardTitle>
                  <CardDescription>
                    Create, assign, and track tasks across departments with priorities, deadlines, and progress monitoring.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Project Coordination</CardTitle>
                  <CardDescription>
                    Organize company projects, track milestones, and ensure timely delivery across all teams.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Team Collaboration</CardTitle>
                  <CardDescription>
                    Connect departments, share resources, and collaborate on cross-functional initiatives.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Schedule Management</CardTitle>
                  <CardDescription>
                    Coordinate meetings, deadlines, and company events with integrated calendar features.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Monitor team productivity, project progress, and generate reports for management insights.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Enterprise-grade security ensuring all company data and communications remain confidential.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Departments Section */}
        <section id="departments" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">
              Empowering Every Department
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Human Resources</h3>
                <p className="text-sm text-muted-foreground">Employee onboarding, training schedules, and HR processes</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Sales & Marketing</h3>
                <p className="text-sm text-muted-foreground">Campaign management, lead tracking, and sales goals</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Operations</h3>
                <p className="text-sm text-muted-foreground">Process optimization, resource management, and workflows</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Management</h3>
                <p className="text-sm text-muted-foreground">Strategic planning, team oversight, and decision tracking</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16">
              Paragon Group by the Numbers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Team Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">25+</div>
                <div className="text-muted-foreground">Departments</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Active Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">System Availability</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join your Paragon Group colleagues in making work more organized, 
              efficient, and collaborative with TaskFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                <Link href="/register" className="flex items-center">
                  Start Using TaskFlow
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact IT Support
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="support" className="border-t py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                    <Workflow className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold">TaskFlow</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Paragon Group's internal task management and collaboration platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Access</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                  <li><Link href="/dashboard/tasks" className="hover:text-foreground">My Tasks</Link></li>
                  <li><Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link></li>
                  <li><Link href="/dashboard/calendar" className="hover:text-foreground">Calendar</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground">About Paragon</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Company Policies</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Directory</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                  <li><Link href="#" className="hover:text-foreground">IT Support</Link></li>
                  <li><Link href="#" className="hover:text-foreground">Training Resources</Link></li>
                  <li><Link href="#" className="hover:text-foreground">System Status</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              © 2025 Paragon Group. Internal Use Only. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      {mounted && showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}