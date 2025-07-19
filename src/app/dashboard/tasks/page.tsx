// // src/app/dashboard/tasks/page.tsx - FIXED IMPORTS VERSION
// 'use client'

// import { useState, useCallback, useMemo } from 'react'
// import { 
//   Plus, Database, Grid3X3, Columns, 
//   Calendar, Clock, User, Flag, CheckCircle
// } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Skeleton } from '@/components/ui/skeleton'

// // Import existing components (these should already exist)
// import { TaskForm } from '@/components/tasks/task-form'
// import { useTasks, type Task } from '@/hooks/use-tasks'

// // Import the new components we created
// import { SimpleTaskForm } from '@/components/tasks/simple-task-form'
// import { TaskTableOptimized } from '@/components/tasks/task-table-optimized'
// import { TaskKanbanOptimized } from '@/components/tasks/task-kanban-optimized'

// export default function TasksPage() {
//   const [activeView, setActiveView] = useState('overview')
//   const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
//   const [isTaskERPModalOpen, setIsTaskERPModalOpen] = useState(false)
//   const [selectedTask, setSelectedTask] = useState<Task | undefined>()

//   // 🚀 PERFORMANCE: Use optimized query with minimal data
//   const { data: tasksData, isLoading, error } = useTasks({}, {
//     refetchOnWindowFocus: false,
//     staleTime: 2 * 60 * 1000, // 2 minutes
//   })

//   const tasks = tasksData?.tasks || []

//   // 🚀 PERFORMANCE: Memoize expensive calculations
//   const stats = useMemo(() => ({
//     total: tasks.length,
//     inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
//     completed: tasks.filter(t => t.status === 'COMPLETED').length,
//     urgent: tasks.filter(t => t.priority === 'URGENT').length,
//     overdue: tasks.filter(t => 
//       t.dueDate && 
//       new Date(t.dueDate) < new Date() && 
//       t.status !== 'COMPLETED'
//     ).length
//   }), [tasks])

//   // 🚀 PERFORMANCE: Use useCallback to prevent unnecessary re-renders
//   const handleCreateTask = useCallback(() => {
//     setIsNewTaskModalOpen(true)
//   }, [])

//   const handleEditTask = useCallback((task: Task) => {
//     setSelectedTask(task)
//     setIsTaskERPModalOpen(true)
//   }, [])

//   const handleCloseNewTaskModal = useCallback(() => {
//     setIsNewTaskModalOpen(false)
//   }, [])

//   const handleCloseTaskERPModal = useCallback(() => {
//     setIsTaskERPModalOpen(false)
//     setSelectedTask(undefined)
//   }, [])

//   // Loading state with better UX
//   if (isLoading) {
//     return (
//       <div className="space-y-6 animate-pulse">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <Skeleton className="h-8 w-32 mb-2" />
//             <Skeleton className="h-4 w-64" />
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-3">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <Skeleton key={i} className="h-10 w-24" />
//           ))}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <Skeleton key={i} className="h-24" />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div className="text-center py-12">
//           <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
//             <CheckCircle className="h-8 w-8 text-red-600" />
//           </div>
//           <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Tasks</h3>
//           <p className="text-red-600 mb-4">Failed to load tasks. Please try again.</p>
//           <Button onClick={() => window.location.reload()}>
//             Reload Page
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   const renderOverview = () => (
//     <div className="space-y-6">
//       {/* Stats Cards - Optimized */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card className="hover:shadow-md transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Tasks</p>
//                 <p className="text-2xl font-bold">{stats.total}</p>
//               </div>
//               <Grid3X3 className="h-8 w-8 text-blue-600" />
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="hover:shadow-md transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">In Progress</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
//               </div>
//               <Clock className="h-8 w-8 text-blue-600" />
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="hover:shadow-md transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Completed</p>
//                 <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-green-600" />
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="hover:shadow-md transition-shadow">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   {stats.overdue > 0 ? 'Overdue' : 'Urgent'}
//                 </p>
//                 <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-orange-600'}`}>
//                   {stats.overdue > 0 ? stats.overdue : stats.urgent}
//                 </p>
//               </div>
//               <Flag className={`h-8 w-8 ${stats.overdue > 0 ? 'text-red-600' : 'text-orange-600'}`} />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Tasks Preview - Optimized */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Tasks</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {tasks.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
//                 <Plus className="h-6 w-6 text-muted-foreground" />
//               </div>
//               <p className="text-muted-foreground mb-4">No tasks yet</p>
//               <Button onClick={handleCreateTask}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Create Your First Task
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {tasks.slice(0, 5).map(task => (
//                 <div 
//                   key={task.id} 
//                   className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
//                   onClick={() => handleEditTask(task)}
//                 >
//                   <div className="flex-1 min-w-0">
//                     <h4 className="font-medium truncate">{task.title || task.name}</h4>
//                     <p className="text-sm text-muted-foreground truncate">
//                       {task.assignee?.name ? `Assigned to: ${task.assignee.name}` : 'Unassigned'}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2 flex-shrink-0">
//                     <Badge 
//                       variant="outline"
//                       className={
//                         task.priority === 'URGENT' ? 'border-red-200 text-red-700' :
//                         task.priority === 'HIGH' ? 'border-orange-200 text-orange-700' :
//                         task.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-700' :
//                         'border-green-200 text-green-700'
//                       }
//                     >
//                       {task.priority}
//                     </Badge>
//                     <Badge 
//                       variant="secondary"
//                       className={
//                         task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
//                         task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
//                         task.status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-800' :
//                         'bg-gray-100 text-gray-800'
//                       }
//                     >
//                       {task.status.replace('_', ' ')}
//                     </Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Tasks</h1>
//           <p className="text-muted-foreground">
//             Manage and track your project tasks
//             {stats.total > 0 && (
//               <span className="ml-2 text-sm bg-muted px-2 py-1 rounded">
//                 {stats.total} total tasks
//               </span>
//             )}
//           </p>
//         </div>
//       </div>

//       {/* Navigation Buttons - Improved */}
//       <div className="flex flex-wrap gap-3">
//         <Button
//           onClick={handleCreateTask}
//           className="flex items-center gap-2"
//           size="sm"
//         >
//           <Plus className="h-4 w-4" />
//           New Task
//         </Button>
        
//         <Button
//           variant="outline"
//           onClick={() => setIsTaskERPModalOpen(true)}
//           className="flex items-center gap-2"
//           size="sm"
//         >
//           <Database className="h-4 w-4" />
//           Task ERP
//         </Button>
        
//         <Button
//           variant={activeView === 'table' ? 'default' : 'outline'}
//           onClick={() => setActiveView('table')}
//           className="flex items-center gap-2"
//           size="sm"
//         >
//           <Grid3X3 className="h-4 w-4" />
//           Table
//         </Button>
        
//         <Button
//           variant={activeView === 'kanban' ? 'default' : 'outline'}
//           onClick={() => setActiveView('kanban')}
//           className="flex items-center gap-2"
//           size="sm"
//         >
//           <Columns className="h-4 w-4" />
//           Kanban
//         </Button>
        
//         {/* Progress indicator */}
//         {stats.total > 0 && (
//           <div className="flex items-center gap-2 ml-auto">
//             <div className="text-sm text-muted-foreground">
//               Progress: {Math.round((stats.completed / stats.total) * 100)}%
//             </div>
//             <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
//               <div 
//                 className="h-full bg-green-500 transition-all duration-300"
//                 style={{ width: `${(stats.completed / stats.total) * 100}%` }}
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Content Area - Optimized Rendering */}
//       <div className="min-h-[600px]">
//         {activeView === 'table' && (
//           <TaskTableOptimized 
//             tasks={tasks} 
//             isLoading={isLoading}
//             onEditTask={handleEditTask}
//           />
//         )}
//         {activeView === 'kanban' && (
//           <TaskKanbanOptimized 
//             tasks={tasks} 
//             isLoading={isLoading}
//             onEditTask={handleEditTask}
//           />
//         )}
//         {(activeView === 'overview' || (!['table', 'kanban'].includes(activeView))) && renderOverview()}
//       </div>

//       {/* 🔧 FIXED: Better Modal Positioning and Performance */}
//       <SimpleTaskForm
//         isOpen={isNewTaskModalOpen}
//         onClose={handleCloseNewTaskModal}
//       />

//       <TaskForm
//         isOpen={isTaskERPModalOpen}
//         onClose={handleCloseTaskERPModal}
//         task={selectedTask}
//         mode={selectedTask ? 'edit' : 'create'}
//       />
//     </div>
//   )
// }




// src/app/dashboard/tasks/page.tsx - FIXED FORM DETECTION
'use client'

import { useState, useCallback, useMemo } from 'react'
import { 
  Plus, Database, Grid3X3, Columns, 
  Calendar, Clock, User, Flag, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Import existing components
import { TaskForm } from '@/components/tasks/task-form'
import { TaskActionMenu } from '@/components/tasks/task-action-menu'
import { useTasks, type Task } from '@/hooks/use-tasks'

// Import the new components
import { SimpleTaskForm } from '@/components/tasks/simple-task-form'
import { TaskTableOptimized } from '@/components/tasks/task-table-optimized'
import { TaskKanbanOptimized } from '@/components/tasks/task-kanban-optimized'

export default function TasksPage() {
  const [activeView, setActiveView] = useState('overview')
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [isTaskERPModalOpen, setIsTaskERPModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  // ✅ NEW: Store which form was used to create each task
  const [taskFormTypes, setTaskFormTypes] = useState<Record<string, 'simple' | 'erp'>>({})

  // Performance: Use optimized query with minimal data
  const { data: tasksData, isLoading, error } = useTasks({}, {
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const tasks = tasksData?.tasks || []

  // Performance: Memoize expensive calculations
  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
    urgent: tasks.filter(t => t.priority === 'URGENT').length,
    overdue: tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'COMPLETED'
    ).length
  }), [tasks])

  // ✅ FIXED: Create task handlers with form tracking
  const handleCreateSimpleTask = useCallback(() => {
    setSelectedTask(undefined)
    setIsNewTaskModalOpen(true)
  }, [])

  const handleCreateERPTask = useCallback(() => {
    setSelectedTask(undefined)
    setIsTaskERPModalOpen(true)
  }, [])

  // ✅ FIXED: Track which form created each task
  const handleTaskCreated = useCallback((taskId: string, formType: 'simple' | 'erp') => {
    setTaskFormTypes(prev => ({ ...prev, [taskId]: formType }))
  }, [])

  // ✅ FIXED: Edit task - use stored form type or detect
  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task)
    
    // ✅ First, check if we stored which form was used
    const storedFormType = taskFormTypes[task.id]
    
    if (storedFormType) {
      // Use the stored form type
      if (storedFormType === 'erp') {
        setIsTaskERPModalOpen(true)
      } else {
        setIsNewTaskModalOpen(true)
      }
      return
    }
    
    // ✅ Fallback: Detect based on task complexity
    const isComplexTask = !!(
      task.moduleId || 
      task.devDeptId || 
      task.taskTypeId || 
      task.subTaskId || 
      task.modifyId || 
      task.referenceId ||
      task.trackingNo ||
      task.sentBy ||
      task.solveDate
    )
    
    if (isComplexTask) {
      setIsTaskERPModalOpen(true)
    } else {
      setIsNewTaskModalOpen(true)
    }
  }, [taskFormTypes])

  // ✅ FIXED: View task
  const handleViewTask = useCallback((task: Task) => {
    // Just show in edit mode for now
    handleEditTask(task)
  }, [handleEditTask])

  const handleCloseNewTaskModal = useCallback(() => {
    setIsNewTaskModalOpen(false)
    setSelectedTask(undefined)
  }, [])

  const handleCloseTaskERPModal = useCallback(() => {
    setIsTaskERPModalOpen(false)
    setSelectedTask(undefined)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Tasks</h3>
          <p className="text-red-600 mb-4">Failed to load tasks. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Grid3X3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {stats.overdue > 0 ? 'Overdue' : 'Urgent'}
                </p>
                <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {stats.overdue > 0 ? stats.overdue : stats.urgent}
                </p>
              </div>
              <Flag className={`h-8 w-8 ${stats.overdue > 0 ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks Preview - WITH ACTION MENU */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No tasks yet</p>
              <Button onClick={handleCreateSimpleTask}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 5).map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{task.title || task.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {task.assignee?.name ? `Assigned to: ${task.assignee.name}` : 'Unassigned'}
                    </p>
                    {/* Show which form type */}
                    <p className="text-xs text-muted-foreground">
                      Form: {taskFormTypes[task.id] || 'auto-detect'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant="outline"
                      className={
                        task.priority === 'URGENT' ? 'border-red-200 text-red-700' :
                        task.priority === 'HIGH' ? 'border-orange-200 text-orange-700' :
                        task.priority === 'MEDIUM' ? 'border-yellow-200 text-yellow-700' :
                        'border-green-200 text-green-700'
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge 
                      variant="secondary"
                      className={
                        task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'IN_REVIEW' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                    {/* ✅ FIXED: Use TaskActionMenu */}
                    <TaskActionMenu
                      task={task}
                      onEdit={handleEditTask}
                      onView={handleViewTask}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your project tasks
            {stats.total > 0 && (
              <span className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                {stats.total} total tasks
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCreateSimpleTask}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Quick Task (Simple Form)
        </Button>
        
        <Button
          variant="outline"
          onClick={handleCreateERPTask}
          className="flex items-center gap-2"
          size="sm"
        >
          <Database className="h-4 w-4" />
          Detailed Task (ERP Form)
        </Button>
        
        <Button
          variant={activeView === 'table' ? 'default' : 'outline'}
          onClick={() => setActiveView('table')}
          className="flex items-center gap-2"
          size="sm"
        >
          <Grid3X3 className="h-4 w-4" />
          Table
        </Button>
        
        <Button
          variant={activeView === 'kanban' ? 'default' : 'outline'}
          onClick={() => setActiveView('kanban')}
          className="flex items-center gap-2"
          size="sm"
        >
          <Columns className="h-4 w-4" />
          Kanban
        </Button>
        
        {/* Progress indicator */}
        {stats.total > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="text-sm text-muted-foreground">
              Progress: {Math.round((stats.completed / stats.total) * 100)}%
            </div>
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeView === 'table' && (
          <TaskTableOptimized 
            tasks={tasks} 
            isLoading={isLoading}
            onEditTask={handleEditTask}
          />
        )}
        {activeView === 'kanban' && (
          <TaskKanbanOptimized 
            tasks={tasks} 
            isLoading={isLoading}
            onEditTask={handleEditTask}
          />
        )}
        {(activeView === 'overview' || (!['table', 'kanban'].includes(activeView))) && renderOverview()}
      </div>

      {/* ✅ FIXED: Modal Management with Form Tracking */}
      {/* Simple Task Form */}
      <SimpleTaskForm
        isOpen={isNewTaskModalOpen}
        onClose={handleCloseNewTaskModal}
        task={selectedTask}
        mode={selectedTask ? 'edit' : 'create'}
        onTaskCreated={(taskId) => handleTaskCreated(taskId, 'simple')}
      />

      {/* ERP Task Form */}
      <TaskForm
        isOpen={isTaskERPModalOpen}
        onClose={handleCloseTaskERPModal}
        task={selectedTask}
        mode={selectedTask ? 'edit' : 'create'}
        onTaskCreated={(taskId) => handleTaskCreated(taskId, 'erp')}
      />
    </div>
  )
}