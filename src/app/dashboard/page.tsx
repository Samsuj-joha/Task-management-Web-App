// src/app/dashboard/page.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useTasks } from '@/hooks/use-tasks'
import { useProjects } from '@/hooks/use-projects'
import { TaskCard } from '@/components/tasks/task-card'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Calendar,
  Users,
  Target,
  ArrowRight,
  Settings,
  Building2,
  FileText,
  FolderOpen,
  BarChart3,
  Play,
  Pause
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: tasksData, isLoading: tasksLoading } = useTasks()
  const { data: projectsData, isLoading: projectsLoading } = useProjects()
  
  const tasks = tasksData?.tasks || []
  const projects = projectsData?.projects || []

  // Calculate task stats
  const taskStats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false
      return new Date(t.dueDate) < new Date()
    }).length,
  }

  // Calculate project stats
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    onHold: projects.filter(p => p.status === 'PAUSED').length,
  }

  // Module distribution
  const moduleStats = tasks.reduce((acc, task) => {
    const module = task.module || 'Unassigned'
    acc[module] = (acc[module] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Department distribution
  const deptStats = tasks.reduce((acc, task) => {
    const dept = task.devDept || 'Unassigned'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // Get recent projects (last 3)
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  // Get upcoming deadlines
  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && t.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3)

  // Get urgent tasks
  const urgentTasks = tasks
    .filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED')
    .slice(0, 3)

  const isLoading = tasksLoading || projectsLoading

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TaskFlow Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage all development tasks and projects across modules and departments.
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">
              <FolderOpen className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/tasks">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{taskStats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {taskStats.total > 0 ? 'Active in system' : 'No tasks yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{projectStats.active}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {projectStats.total} total projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{taskStats.inProgress}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Tasks being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {taskStats.completed} of {taskStats.total} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>
                    Latest tasks and their current status
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/tasks">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {task.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.module && (
                            <span className="flex items-center gap-1">
                              <Settings className="h-3 w-3" />
                              {task.module}
                            </span>
                          )}
                          {task.taskType && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {task.taskType}
                            </span>
                          )}
                          {task.trackingNo && (
                            <span className="font-mono">#{task.trackingNo}</span>
                          )}
                          {task.devDept && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {task.devDept}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            task.priority === 'URGENT' ? 'destructive' : 
                            task.priority === 'HIGH' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first task to get started
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/tasks">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start">
                <Link href="/dashboard/tasks">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Task
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/dashboard/projects">
                  <Target className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/dashboard/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Open Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Latest project activity</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/projects">
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => {
                    const totalTasks = project._count?.tasks || 0
                    const completedTasks = project.tasks?.filter(t => t.status === 'COMPLETED').length || 0
                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                    
                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/dashboard/projects/${project.id}`}
                            className="font-medium text-sm hover:underline truncate"
                          >
                            {project.name}
                          </Link>
                          <Badge 
                            variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{project._count?.members || 0} members</span>
                          <span>•</span>
                          <span>{totalTasks} tasks</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No projects yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/projects">
                      <Plus className="mr-2 h-3 w-3" />
                      Create Project
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Urgent Tasks
              </CardTitle>
              <CardDescription>
                High priority tasks requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : urgentTasks.length > 0 ? (
                <div className="space-y-3">
                  {urgentTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg border-l-4 border-red-500 bg-red-50/50">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.module} • {task.taskType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No urgent tasks</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Module Distribution</CardTitle>
              <CardDescription>
                Tasks by module
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : Object.keys(moduleStats).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(moduleStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([module, count]) => (
                      <div key={module} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground truncate flex-1 mr-2">{module}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}