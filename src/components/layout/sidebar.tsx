

// src/components/layout/sidebar.tsx (Updated with Simple Loading)
'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { SimpleLoadingLink } from '@/components/ui/simple-loading'
import { useSidebar } from '@/contexts/sidebar-context'
import { useTasks } from '@/hooks/use-tasks'
import { useProjects } from '@/hooks/use-projects'
import {
  LayoutDashboard,
  CheckSquare,
  FolderOpen,
  Calendar,
  BarChart3,
  Settings,
  Users,
  Tag,
  Clock,
  Star,
  X,
  AlertCircle,
  PlayCircle,
  Pause,
  Target
} from 'lucide-react'

const baseNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    loadingMessage: 'Loading Dashboard...'
  },
  {
    name: 'Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    showBadge: true,
    badgeKey: 'tasks',
    loadingMessage: 'Loading Tasks...'
  },
  {
    name: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
    showBadge: true,
    badgeKey: 'projects',
    loadingMessage: 'Loading Projects...'
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    loadingMessage: 'Loading Calendar...'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    loadingMessage: 'Loading Analytics...'
  },
]

const secondaryNavigation = [
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
    loadingMessage: 'Loading Team...'
  },
  {
    name: 'Tags',
    href: '/dashboard/tags',
    icon: Tag,
    loadingMessage: 'Loading Tags...'
  },
  {
    name: 'Time Tracking',
    href: '/dashboard/time',
    icon: Clock,
    loadingMessage: 'Loading Time Tracking...'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()
  
  // Fetch both tasks and projects data for dynamic counts
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  
  const tasks = tasksData?.tasks || []
  const projects = projectsData?.projects || []
  
  // Calculate dynamic counts
  const counts = {
    tasks: tasks.length,
    projects: projects.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    urgent: tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false
      return new Date(t.dueDate) < new Date()
    }).length,
    activeProjects: projects.filter(p => p.status === 'ACTIVE').length,
    pausedProjects: projects.filter(p => p.status === 'PAUSED').length,
    completedProjects: projects.filter(p => p.status === 'COMPLETED').length,
    overdueProjects: projects.filter(p => {
      if (!p.endDate || p.status === 'COMPLETED') return false
      return new Date(p.endDate) < new Date()
    }).length,
  }

  const getBadgeCount = (badgeKey: string) => {
    switch (badgeKey) {
      case 'tasks':
        return counts.tasks
      case 'projects':
        return counts.projects
      default:
        return 0
    }
  }

  const isLoading = tasksLoading || projectsLoading

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-50 h-screen w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'md:sticky md:top-16 md:h-[calc(100vh-4rem)]'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-4 md:hidden">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </div>
              <span className="font-bold text-lg">TaskFlow</span>
            </div>
            <Button variant="ghost" size="icon" onClick={close}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Main Navigation */}
            <nav className="space-y-2">
              {baseNavigation.map((item) => {
                const isActive = pathname === item.href
                const badgeCount = item.showBadge ? getBadgeCount(item.badgeKey || '') : 0
                
                return (
                  <SimpleLoadingLink
                    key={item.name}
                    href={item.href}
                    loadingMessage={item.loadingMessage}
                    onClick={() => close()}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {item.showBadge && (
                      <div className="ml-auto">
                        {isLoading ? (
                          <Skeleton className="h-5 w-6 rounded-full" />
                        ) : badgeCount > 0 ? (
                          <Badge variant={isActive ? 'secondary' : 'outline'}>
                            {badgeCount}
                          </Badge>
                        ) : null}
                      </div>
                    )}
                  </SimpleLoadingLink>
                )
              })}
            </nav>

            <Separator className="my-4" />

            {/* Task Status Section */}
            <div>
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Task Status
              </h4>
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-5 w-6 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-5 w-6 rounded-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center space-x-3 text-muted-foreground">
                        <PlayCircle className="h-4 w-4" />
                        <span>In Progress</span>
                      </div>
                      {counts.inProgress > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {counts.inProgress}
                        </Badge>
                      )}
                    </div>

                    {counts.urgent > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center space-x-3 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Urgent</span>
                        </div>
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          {counts.urgent}
                        </Badge>
                      </div>
                    )}

                    {counts.overdue > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center space-x-3 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span>Overdue</span>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {counts.overdue}
                        </Badge>
                      </div>
                    )}

                    {counts.tasks === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        <span>No tasks yet</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Project Status Section */}
            <div>
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Project Status
              </h4>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-5 w-6 rounded-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="flex items-center space-x-3 text-muted-foreground">
                        <PlayCircle className="h-4 w-4" />
                        <span>Active</span>
                      </div>
                      {counts.activeProjects > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {counts.activeProjects}
                        </Badge>
                      )}
                    </div>

                    {counts.pausedProjects > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center space-x-3 text-yellow-600">
                          <Pause className="h-4 w-4" />
                          <span>Paused</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
                          {counts.pausedProjects}
                        </Badge>
                      </div>
                    )}

                    {counts.overdueProjects > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center space-x-3 text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Overdue</span>
                        </div>
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          {counts.overdueProjects}
                        </Badge>
                      </div>
                    )}

                    {counts.completedProjects > 0 && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm">
                        <div className="flex items-center space-x-3 text-green-600">
                          <Target className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                          {counts.completedProjects}
                        </Badge>
                      </div>
                    )}

                    {counts.projects === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        <span>No projects yet</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Secondary Navigation */}
            <div>
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Workspace
              </h4>
              <nav className="space-y-2">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <SimpleLoadingLink
                      key={item.name}
                      href={item.href}
                      loadingMessage={item.loadingMessage}
                      onClick={() => close()}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </SimpleLoadingLink>
                  )
                })}
              </nav>
            </div>

            <Separator className="my-4" />

            {/* Quick Actions */}
            <div>
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <SimpleLoadingLink
                  href="/dashboard/tasks?filter=starred"
                  loadingMessage="Loading Starred Tasks..."
                  onClick={() => close()}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors no-underline"
                >
                  <Star className="h-4 w-4" />
                  <span>Starred Tasks</span>
                </SimpleLoadingLink>
                <SimpleLoadingLink
                  href="/dashboard/tasks?filter=recent"
                  loadingMessage="Loading Recent Tasks..."
                  onClick={() => close()}
                  className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors no-underline"
                >
                  <Clock className="h-4 w-4" />
                  <span>Recent</span>
                </SimpleLoadingLink>
              </div>
            </div>
          </div>

          {/* Settings at bottom */}
          <div className="border-t p-4">
            <SimpleLoadingLink
              href="/dashboard/settings"
              loadingMessage="Loading Settings..."
              onClick={() => close()}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors no-underline',
                pathname === '/dashboard/settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </SimpleLoadingLink>
          </div>
        </div>
      </aside>
    </>
  )
}