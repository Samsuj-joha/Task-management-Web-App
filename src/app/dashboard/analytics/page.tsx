// // src/app/dashboard/analytics/page.tsx
// 'use client'

// import { useState, useMemo } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Skeleton } from '@/components/ui/skeleton'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import { Progress } from '@/components/ui/progress'
// import { useTasks } from '@/hooks/use-tasks'
// import { useProjects } from '@/hooks/use-projects'
// import { ExcelExporter } from '@/utils/excel-export'
// import { toast } from 'sonner'
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   Area,
//   AreaChart
// } from 'recharts'
// import { 
//   TrendingUp,
//   TrendingDown,
//   BarChart3,
//   PieChart as PieChartIcon,
//   Activity,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   Target,
//   Users,
//   Calendar,
//   Filter,
//   Download,
//   RefreshCw,
//   ChevronDown,
//   FileText,
//   FolderOpen,
//   CheckSquare
// } from 'lucide-react'
// import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns'

// type TimeRange = '7d' | '30d' | '90d' | '1y'

// // Color schemes for charts
// const COLORS = {
//   primary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
//   status: {
//     TODO: '#6B7280',
//     IN_PROGRESS: '#3B82F6', 
//     IN_REVIEW: '#F59E0B',
//     COMPLETED: '#10B981',
//     CANCELLED: '#EF4444',
//   },
//   priority: {
//     LOW: '#10B981',
//     MEDIUM: '#F59E0B', 
//     HIGH: '#F97316',
//     URGENT: '#EF4444',
//   },
//   projects: {
//     ACTIVE: '#3B82F6',
//     PAUSED: '#F59E0B',
//     COMPLETED: '#10B981',
//     CANCELLED: '#EF4444',
//   }
// }

// export default function AnalyticsPage() {
//   const [timeRange, setTimeRange] = useState<TimeRange>('30d')

//   // Fetch data
//   const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks()
//   const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useProjects()

//   const tasks = tasksData?.tasks || []
//   const projects = projectsData?.projects || []
//   const isLoading = tasksLoading || projectsLoading

//   // Calculate date range
//   const dateRange = useMemo(() => {
//     const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
//     const endDate = new Date()
//     const startDate = subDays(endDate, days)
//     return { startDate, endDate }
//   }, [timeRange])

//   // Overall Statistics
//   const stats = useMemo(() => {
//     const totalTasks = tasks.length
//     const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
//     const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
//     const overdueTasks = tasks.filter(t => {
//       if (!t.dueDate || t.status === 'COMPLETED') return false
//       return new Date(t.dueDate) < new Date()
//     }).length

//     const totalProjects = projects.length
//     const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
//     const completedProjects = projects.filter(p => p.status === 'COMPLETED').length

//     const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
//     const productivityScore = totalTasks > 0 ? Math.round(((completedTasks * 2 + inProgressTasks) / (totalTasks * 2)) * 100) : 0

//     return {
//       totalTasks,
//       completedTasks,
//       inProgressTasks,
//       overdueTasks,
//       totalProjects,
//       activeProjects,
//       completedProjects,
//       completionRate,
//       productivityScore,
//     }
//   }, [tasks, projects])

//   // Task Status Distribution
//   const taskStatusData = useMemo(() => {
//     const statusCounts = tasks.reduce((acc, task) => {
//       acc[task.status] = (acc[task.status] || 0) + 1
//       return acc
//     }, {} as Record<string, number>)

//     return Object.entries(statusCounts).map(([status, count]) => ({
//       name: status.replace('_', ' '),
//       value: count,
//       color: COLORS.status[status as keyof typeof COLORS.status],
//     }))
//   }, [tasks])

//   // Priority Distribution
//   const priorityData = useMemo(() => {
//     const priorityCounts = tasks.reduce((acc, task) => {
//       acc[task.priority] = (acc[task.priority] || 0) + 1
//       return acc
//     }, {} as Record<string, number>)

//     return Object.entries(priorityCounts).map(([priority, count]) => ({
//       name: priority,
//       value: count,
//       color: COLORS.priority[priority as keyof typeof COLORS.priority],
//     }))
//   }, [tasks])

//   // Module Performance
//   const moduleData = useMemo(() => {
//     const moduleStats = tasks.reduce((acc, task) => {
//       const module = task.module || 'Unassigned'
//       if (!acc[module]) {
//         acc[module] = { total: 0, completed: 0, inProgress: 0, overdue: 0 }
//       }
//       acc[module].total++
//       if (task.status === 'COMPLETED') acc[module].completed++
//       if (task.status === 'IN_PROGRESS') acc[module].inProgress++
//       if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED') {
//         acc[module].overdue++
//       }
//       return acc
//     }, {} as Record<string, any>)

//     return Object.entries(moduleStats).map(([module, stats]) => ({
//       module,
//       total: stats.total,
//       completed: stats.completed,
//       inProgress: stats.inProgress,
//       overdue: stats.overdue,
//       completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
//     })).sort((a, b) => b.total - a.total)
//   }, [tasks])

//   // Daily Productivity (last 30 days)
//   const productivityData = useMemo(() => {
//     const days = eachDayOfInterval({
//       start: subDays(new Date(), 29),
//       end: new Date()
//     })

//     return days.map(day => {
//       const dayStart = startOfDay(day)
//       const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1)

//       const tasksCompleted = tasks.filter(task => {
//         if (!task.completedAt) return false
//         const completedDate = new Date(task.completedAt)
//         return completedDate >= dayStart && completedDate <= dayEnd
//       }).length

//       const tasksCreated = tasks.filter(task => {
//         const createdDate = new Date(task.createdAt)
//         return createdDate >= dayStart && createdDate <= dayEnd
//       }).length

//       return {
//         date: format(day, 'MMM dd'),
//         completed: tasksCompleted,
//         created: tasksCreated,
//         productivity: tasksCompleted - tasksCreated + 10, // Baseline of 10 for better visualization
//       }
//     })
//   }, [tasks])

//   // Project Progress
//   const projectProgressData = useMemo(() => {
//     return projects.map(project => {
//       const totalTasks = project._count?.tasks || 0
//       const completedTasks = project.tasks?.filter(t => t.status === 'COMPLETED').length || 0
//       const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

//       return {
//         name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
//         progress,
//         totalTasks,
//         completedTasks,
//         status: project.status,
//       }
//     }).sort((a, b) => b.progress - a.progress)
//   }, [projects])

//   // Department Performance
//   const departmentData = useMemo(() => {
//     const deptStats = tasks.reduce((acc, task) => {
//       const dept = task.devDept || 'Unassigned'
//       if (!acc[dept]) {
//         acc[dept] = { total: 0, completed: 0, urgent: 0 }
//       }
//       acc[dept].total++
//       if (task.status === 'COMPLETED') acc[dept].completed++
//       if (task.priority === 'URGENT') acc[dept].urgent++
//       return acc
//     }, {} as Record<string, any>)

//     return Object.entries(deptStats).map(([dept, stats]) => ({
//       department: dept,
//       total: stats.total,
//       completed: stats.completed,
//       urgent: stats.urgent,
//       efficiency: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
//     })).sort((a, b) => b.efficiency - a.efficiency)
//   }, [tasks])

//   const handleRefresh = async () => {
//     await Promise.all([refetchTasks(), refetchProjects()])
//   }

//   const handleExport = () => {
//     const result = ExcelExporter.exportTasksToExcel(tasks, projects)
    
//     if (result.success) {
//       toast.success('📊 Excel Report Exported Successfully!', {
//         description: `${result.recordsExported.tasks} tasks and ${result.recordsExported.projects} projects exported`,
//         duration: 4000,
//       })
//     } else {
//       toast.error('Export Failed', {
//         description: 'There was an error exporting your data. Please try again.',
//         duration: 3000,
//       })
//     }
//   }

//   const handleExportTasks = () => {
//     const result = ExcelExporter.exportTasksOnly(tasks)
    
//     if (result.success) {
//       toast.success('📋 Tasks Report Exported!', {
//         description: `${result.recordsExported.tasks} tasks exported successfully`,
//         duration: 3000,
//       })
//     }
//   }

//   const handleExportProjects = () => {
//     const result = ExcelExporter.exportProjectsOnly(projects)
    
//     if (result.success) {
//       toast.success('📂 Projects Report Exported!', {
//         description: `${result.recordsExported.projects} projects exported successfully`, 
//         duration: 3000,
//       })
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
//           <p className="text-muted-foreground">
//             Insights and performance metrics for tasks and projects
//           </p>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
//             <SelectTrigger className="w-[120px]">
//               <Calendar className="h-4 w-4 mr-2" />
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="7d">Last 7 days</SelectItem>
//               <SelectItem value="30d">Last 30 days</SelectItem>
//               <SelectItem value="90d">Last 90 days</SelectItem>
//               <SelectItem value="1y">Last year</SelectItem>
//             </SelectContent>
//           </Select>
          
//           <Button variant="outline" size="sm" onClick={handleRefresh}>
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
          
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <Download className="h-4 w-4 mr-2" />
//                 Export
//                 <ChevronDown className="h-4 w-4 ml-1" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={handleExport}>
//                 <FileText className="mr-2 h-4 w-4" />
//                 Full Report (Tasks + Projects)
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem onClick={handleExportTasks}>
//                 <CheckSquare className="mr-2 h-4 w-4" />
//                 Tasks Only
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleExportProjects}>
//                 <FolderOpen className="mr-2 h-4 w-4" />
//                 Projects Only
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
//             <Target className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
//             )}
//             <p className="text-xs text-muted-foreground">
//               {stats.completedTasks} of {stats.totalTasks} tasks completed
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <div className={`text-2xl font-bold ${
//                 stats.productivityScore >= 80 ? 'text-green-600' :
//                 stats.productivityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
//               }`}>
//                 {stats.productivityScore}%
//               </div>
//             )}
//             <p className="text-xs text-muted-foreground">
//               Based on completion and progress
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Work</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
//             )}
//             <p className="text-xs text-muted-foreground">
//               Tasks currently in progress
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Issues</CardTitle>
//             <AlertCircle className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <Skeleton className="h-8 w-16" />
//             ) : (
//               <div className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
//                 {stats.overdueTasks}
//               </div>
//             )}
//             <p className="text-xs text-muted-foreground">
//               {stats.overdueTasks > 0 ? 'Overdue tasks' : 'No overdue tasks'}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Task Status Distribution */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <PieChartIcon className="h-5 w-5" />
//               Task Status Distribution
//             </CardTitle>
//             <CardDescription>
//               Breakdown of tasks by current status
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <div className="h-[300px] flex items-center justify-center">
//                 <Skeleton className="h-48 w-48 rounded-full" />
//               </div>
//             ) : taskStatusData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={taskStatusData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {taskStatusData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="h-[300px] flex items-center justify-center text-muted-foreground">
//                 No task data available
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Priority Distribution */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <BarChart3 className="h-5 w-5" />
//               Priority Distribution
//             </CardTitle>
//             <CardDescription>
//               Tasks organized by priority level
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <div className="h-[300px] flex items-center justify-center">
//                 <Skeleton className="h-48 w-full" />
//               </div>
//             ) : priorityData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={priorityData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="value" fill="#3B82F6" />
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="h-[300px] flex items-center justify-center text-muted-foreground">
//                 No priority data available
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* Module Performance */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Module Performance</CardTitle>
//           <CardDescription>
//             Task completion rates and workload by module
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="space-y-4">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <div key={i} className="flex items-center space-x-4">
//                   <Skeleton className="h-4 w-20" />
//                   <Skeleton className="h-4 flex-1" />
//                   <Skeleton className="h-4 w-12" />
//                 </div>
//               ))}
//             </div>
//           ) : moduleData.length > 0 ? (
//             <div className="space-y-4">
//               {moduleData.map((module) => (
//                 <div key={module.module} className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium">{module.module}</span>
//                       <Badge variant="outline">{module.total} tasks</Badge>
//                       {module.overdue > 0 && (
//                         <Badge variant="destructive">{module.overdue} overdue</Badge>
//                       )}
//                     </div>
//                     <span className="text-sm font-medium">{module.completionRate}%</span>
//                   </div>
//                   <Progress value={module.completionRate} className="h-2" />
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>{module.completed} completed</span>
//                     <span>{module.inProgress} in progress</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-muted-foreground">
//               No module data available
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Daily Productivity Trend */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Daily Productivity Trend</CardTitle>
//           <CardDescription>
//             Task completion and creation over the last 30 days
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="h-[300px] flex items-center justify-center">
//               <Skeleton className="h-48 w-full" />
//             </div>
//           ) : (
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={productivityData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" />
//                 <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
//               </AreaChart>
//             </ResponsiveContainer>
//           )}
//         </CardContent>
//       </Card>

//       {/* Project Progress */}
//       {projects.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Project Progress</CardTitle>
//             <CardDescription>
//               Completion status of all active projects
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {isLoading ? (
//               <div className="space-y-4">
//                 {Array.from({ length: 3 }).map((_, i) => (
//                   <div key={i} className="flex items-center space-x-4">
//                     <Skeleton className="h-4 w-32" />
//                     <Skeleton className="h-4 flex-1" />
//                     <Skeleton className="h-4 w-12" />
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {projectProgressData.map((project) => (
//                   <div key={project.name} className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <span className="font-medium">{project.name}</span>
//                         <Badge variant="outline">{project.totalTasks} tasks</Badge>
//                         <Badge 
//                           variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
//                         >
//                           {project.status}
//                         </Badge>
//                       </div>
//                       <span className="text-sm font-medium">{project.progress}%</span>
//                     </div>
//                     <Progress value={project.progress} className="h-2" />
//                     <div className="text-xs text-muted-foreground">
//                       {project.completedTasks} of {project.totalTasks} tasks completed
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Department Efficiency */}
//       {departmentData.length > 1 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Department Efficiency</CardTitle>
//             <CardDescription>
//               Performance comparison across development departments
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={departmentData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="department" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="efficiency" fill="#3B82F6" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }





// src/app/dashboard/analytics/page.tsx - FIXED VERSION
'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useTasks } from '@/hooks/use-tasks'
import { useProjects } from '@/hooks/use-projects'
import { ExcelExporter } from '@/utils/excel-export'
import { toast } from 'sonner'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  FileText,
  FolderOpen,
  CheckSquare
} from 'lucide-react'
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns'

type TimeRange = '7d' | '30d' | '90d' | '1y'

// Color schemes for charts
const COLORS = {
  primary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
  status: {
    TODO: '#6B7280',
    IN_PROGRESS: '#3B82F6', 
    IN_REVIEW: '#F59E0B',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
  },
  priority: {
    LOW: '#10B981',
    MEDIUM: '#F59E0B', 
    HIGH: '#F97316',
    URGENT: '#EF4444',
  },
  projects: {
    ACTIVE: '#3B82F6',
    PAUSED: '#F59E0B',
    COMPLETED: '#10B981',
    CANCELLED: '#EF4444',
  }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Fetch data
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks()
  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects } = useProjects()

  const tasks = tasksData?.tasks || []
  const projects = projectsData?.projects || []
  const isLoading = tasksLoading || projectsLoading

  // Calculate date range
  const dateRange = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    return { startDate, endDate }
  }, [timeRange])

  // Overall Statistics
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false
      return new Date(t.dueDate) < new Date()
    }).length

    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const productivityScore = totalTasks > 0 ? Math.round(((completedTasks * 2 + inProgressTasks) / (totalTasks * 2)) * 100) : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalProjects,
      activeProjects,
      completedProjects,
      completionRate,
      productivityScore,
    }
  }, [tasks, projects])

  // Task Status Distribution
  const taskStatusData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      color: COLORS.status[status as keyof typeof COLORS.status],
    }))
  }, [tasks])

  // Priority Distribution
  const priorityData = useMemo(() => {
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority,
      value: count,
      color: COLORS.priority[priority as keyof typeof COLORS.priority],
    }))
  }, [tasks])

  // FIXED: Module Performance - properly access .name property
  const moduleData = useMemo(() => {
    const moduleStats = tasks.reduce((acc, task) => {
      const module = (task.module && task.module.name) ? task.module.name : 'Unassigned'
      if (!acc[module]) {
        acc[module] = { total: 0, completed: 0, inProgress: 0, overdue: 0 }
      }
      acc[module].total++
      if (task.status === 'COMPLETED') acc[module].completed++
      if (task.status === 'IN_PROGRESS') acc[module].inProgress++
      if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED') {
        acc[module].overdue++
      }
      return acc
    }, {} as Record<string, any>)

    return Object.entries(moduleStats).map(([module, stats]) => ({
      module,
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      overdue: stats.overdue,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total)
  }, [tasks])

  // Daily Productivity (last 30 days)
  const productivityData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    })

    return days.map(day => {
      const dayStart = startOfDay(day)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1)

      const tasksCompleted = tasks.filter(task => {
        if (!task.completedAt) return false
        const completedDate = new Date(task.completedAt)
        return completedDate >= dayStart && completedDate <= dayEnd
      }).length

      const tasksCreated = tasks.filter(task => {
        const createdDate = new Date(task.createdAt)
        return createdDate >= dayStart && createdDate <= dayEnd
      }).length

      return {
        date: format(day, 'MMM dd'),
        completed: tasksCompleted,
        created: tasksCreated,
        productivity: tasksCompleted - tasksCreated + 10, // Baseline of 10 for better visualization
      }
    })
  }, [tasks])

  // Project Progress
  const projectProgressData = useMemo(() => {
    return projects.map(project => {
      const totalTasks = project._count?.tasks || 0
      const completedTasks = project.tasks?.filter(t => t.status === 'COMPLETED').length || 0
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
        progress,
        totalTasks,
        completedTasks,
        status: project.status,
      }
    }).sort((a, b) => b.progress - a.progress)
  }, [projects])

  // FIXED: Department Performance - properly access .name property
  const departmentData = useMemo(() => {
    const deptStats = tasks.reduce((acc, task) => {
      const dept = (task.devDept && task.devDept.name) ? task.devDept.name : 'Unassigned'
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0, urgent: 0 }
      }
      acc[dept].total++
      if (task.status === 'COMPLETED') acc[dept].completed++
      if (task.priority === 'URGENT') acc[dept].urgent++
      return acc
    }, {} as Record<string, any>)

    return Object.entries(deptStats).map(([dept, stats]) => ({
      department: dept,
      total: stats.total,
      completed: stats.completed,
      urgent: stats.urgent,
      efficiency: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    })).sort((a, b) => b.efficiency - a.efficiency)
  }, [tasks])

  const handleRefresh = async () => {
    await Promise.all([refetchTasks(), refetchProjects()])
  }

  const handleExport = () => {
    const result = ExcelExporter.exportTasksToExcel(tasks, projects)
    
    if (result.success) {
      toast.success('📊 Excel Report Exported Successfully!', {
        description: `${result.recordsExported.tasks} tasks and ${result.recordsExported.projects} projects exported`,
        duration: 4000,
      })
    } else {
      toast.error('Export Failed', {
        description: 'There was an error exporting your data. Please try again.',
        duration: 3000,
      })
    }
  }

  const handleExportTasks = () => {
    const result = ExcelExporter.exportTasksOnly(tasks)
    
    if (result.success) {
      toast.success('📋 Tasks Report Exported!', {
        description: `${result.recordsExported.tasks} tasks exported successfully`,
        duration: 3000,
      })
    }
  }

  const handleExportProjects = () => {
    const result = ExcelExporter.exportProjectsOnly(projects)
    
    if (result.success) {
      toast.success('📂 Projects Report Exported!', {
        description: `${result.recordsExported.projects} projects exported successfully`, 
        duration: 3000,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for tasks and projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-[120px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <FileText className="mr-2 h-4 w-4" />
                Full Report (Tasks + Projects)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportTasks}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Tasks Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportProjects}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Projects Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats.completionRate}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} of {stats.totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${
                stats.productivityScore >= 80 ? 'text-green-600' :
                stats.productivityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.productivityScore}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Based on completion and progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Work</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Tasks currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold ${stats.overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.overdueTasks}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.overdueTasks > 0 ? 'Overdue tasks' : 'No overdue tasks'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of tasks by current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No task data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Priority Distribution
            </CardTitle>
            <CardDescription>
              Tasks organized by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No priority data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Module Performance</CardTitle>
          <CardDescription>
            Task completion rates and workload by module
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : moduleData.length > 0 ? (
            <div className="space-y-4">
              {moduleData.map((module) => (
                <div key={module.module} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{module.module}</span>
                      <Badge variant="outline">{module.total} tasks</Badge>
                      {module.overdue > 0 && (
                        <Badge variant="destructive">{module.overdue} overdue</Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium">{module.completionRate}%</span>
                  </div>
                  <Progress value={module.completionRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{module.completed} completed</span>
                    <span>{module.inProgress} in progress</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No module data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Productivity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Productivity Trend</CardTitle>
          <CardDescription>
            Task completion and creation over the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" />
                <Area type="monotone" dataKey="created" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Project Progress */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Completion status of all active projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {projectProgressData.map((project) => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{project.name}</span>
                        <Badge variant="outline">{project.totalTasks} tasks</Badge>
                        <Badge 
                          variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {project.completedTasks} of {project.totalTasks} tasks completed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Department Efficiency */}
      {departmentData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Efficiency</CardTitle>
            <CardDescription>
              Performance comparison across development departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}