// // src/components/tasks/task-action-menu.tsx
// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
//   DropdownMenuLabel,
// } from '@/components/ui/dropdown-menu'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog'
// import { useDeleteTask, type Task } from '@/hooks/use-tasks'
// import { 
//   MoreVertical, 
//   Eye, 
//   Edit, 
//   Trash2, 
//   Star,
//   Copy,
//   Archive,
//   Flag,
//   Clock,
//   User,
//   Calendar,
//   AlertCircle,
//   CheckCircle2,
//   XCircle,
//   Pause
// } from 'lucide-react'
// import { format } from 'date-fns'
// import { cn } from '@/lib/utils'

// interface TaskActionMenuProps {
//   task: Task
//   onEdit: (task: Task) => void
//   onView?: (task: Task) => void
//   className?: string
// }

// export function TaskActionMenu({ task, onEdit, onView, className }: TaskActionMenuProps) {
//   const [showViewDialog, setShowViewDialog] = useState(false)
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
//   const deleteTaskMutation = useDeleteTask()

//   const handleEdit = () => {
//     onEdit(task)
//   }

//   const handleView = () => {
//     if (onView) {
//       onView(task)
//     } else {
//       setShowViewDialog(true)
//     }
//   }

//   const handleDelete = async () => {
//     try {
//       await deleteTaskMutation.mutateAsync(task.id)
//       setShowDeleteDialog(false)
//     } catch (error) {
//       // Error handled by mutation
//     }
//   }

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'TODO':
//         return 'bg-gray-100 text-gray-800'
//       case 'IN_PROGRESS':
//         return 'bg-blue-100 text-blue-800'
//       case 'IN_REVIEW':
//         return 'bg-yellow-100 text-yellow-800'
//       case 'COMPLETED':
//         return 'bg-green-100 text-green-800'
//       case 'CANCELLED':
//         return 'bg-red-100 text-red-800'
//       default:
//         return 'bg-gray-100 text-gray-800'
//     }
//   }

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'LOW':
//         return 'bg-green-100 text-green-800 border-green-200'
//       case 'MEDIUM':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-200'
//       case 'HIGH':
//         return 'bg-orange-100 text-orange-800 border-orange-200'
//       case 'URGENT':
//         return 'bg-red-100 text-red-800 border-red-200'
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-200'
//     }
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'TODO':
//         return <Clock className="h-4 w-4" />
//       case 'IN_PROGRESS':
//         return <Pause className="h-4 w-4" />
//       case 'IN_REVIEW':
//         return <Eye className="h-4 w-4" />
//       case 'COMPLETED':
//         return <CheckCircle2 className="h-4 w-4" />
//       case 'CANCELLED':
//         return <XCircle className="h-4 w-4" />
//       default:
//         return <Clock className="h-4 w-4" />
//     }
//   }

//   return (
//     <>
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button 
//             variant="ghost" 
//             size="icon" 
//             className={cn("h-8 w-8", className)}
//           >
//             <MoreVertical className="h-4 w-4" />
//             <span className="sr-only">Task actions</span>
//           </Button>
//         </DropdownMenuTrigger>
        
//         <DropdownMenuContent align="end" className="w-48">
//           <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
//           <DropdownMenuSeparator />
          
//           {/* View Task */}
//           <DropdownMenuItem onClick={handleView}>
//             <Eye className="mr-2 h-4 w-4" />
//             View Details
//           </DropdownMenuItem>
          
//           {/* Edit Task */}
//           <DropdownMenuItem onClick={handleEdit}>
//             <Edit className="mr-2 h-4 w-4" />
//             Edit Task
//           </DropdownMenuItem>
          
//           <DropdownMenuSeparator />
          
//           {/* Quick Actions */}
//           <DropdownMenuItem 
//             onClick={() => navigator.clipboard.writeText(`Task: ${task.name || task.title}`)}
//           >
//             <Copy className="mr-2 h-4 w-4" />
//             Copy Task Name
//           </DropdownMenuItem>
          
//           {task.status !== 'COMPLETED' && (
//             <DropdownMenuItem>
//               <Star className="mr-2 h-4 w-4" />
//               Add to Favorites
//             </DropdownMenuItem>
//           )}
          
//           <DropdownMenuSeparator />
          
//           {/* Delete Task */}
//           <DropdownMenuItem 
//             onClick={() => setShowDeleteDialog(true)}
//             className="text-red-600 focus:text-red-600"
//           >
//             <Trash2 className="mr-2 h-4 w-4" />
//             Delete Task
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>

//       {/* View Task Dialog */}
//       <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               {getStatusIcon(task.status)}
//               {task.name || task.title}
//             </DialogTitle>
//             <DialogDescription>
//               Task Details and Information
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-6">
//             {/* Status and Priority */}
//             <div className="flex flex-wrap gap-2">
//               <Badge className={getStatusColor(task.status)}>
//                 {task.status.replace('_', ' ')}
//               </Badge>
//               <Badge variant="outline" className={getPriorityColor(task.priority)}>
//                 <Flag className="h-3 w-3 mr-1" />
//                 {task.priority} Priority
//               </Badge>
//             </div>
            
//             {/* Basic Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-3">
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Task ID</label>
//                   <p className="text-sm font-mono">{task.id}</p>
//                 </div>
                
//                 {task.trackingNo && (
//                   <div>
//                     <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
//                     <p className="text-sm font-mono">{task.trackingNo}</p>
//                   </div>
//                 )}
                
//                 {task.module?.name && (
//                   <div>
//                     <label className="text-sm font-medium text-muted-foreground">Module</label>
//                     <p className="text-sm">{task.module.name}</p>
//                   </div>
//                 )}
                
//                 {task.taskType?.name && (
//                   <div>
//                     <label className="text-sm font-medium text-muted-foreground">Task Type</label>
//                     <p className="text-sm">{task.taskType.name}</p>
//                   </div>
//                 )}
//               </div>
              
//               <div className="space-y-3">
//                 {task.assignee && (
//                   <div>
//                     <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
//                     <div className="flex items-center gap-2 mt-1">
//                       <User className="h-4 w-4" />
//                       <span className="text-sm">{task.assignee.name || task.assignee.email}</span>
//                     </div>
//                   </div>
//                 )}
                
//                 {task.devDept?.name && (
//                   <div>
//                     <label className="text-sm font-medium text-muted-foreground">Department</label>
//                     <p className="text-sm">{task.devDept.name}</p>
//                   </div>
//                 )}
                
//                 {task.sentBy && (
//                   <div>
//                     <label className="text-sm font-medium text-muted-foreground">Sent By</label>
//                     <p className="text-sm">{task.sentBy}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
            
//             {/* Dates */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <label className="text-sm font-medium text-muted-foreground">Created Date</label>
//                 <div className="flex items-center gap-1 mt-1">
//                   <Calendar className="h-4 w-4" />
//                   <span className="text-sm">
//                     {task.date ? format(new Date(task.date), 'MMM dd, yyyy') : 'Not set'}
//                   </span>
//                 </div>
//               </div>
              
//               {task.dueDate && (
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Due Date</label>
//                   <div className="flex items-center gap-1 mt-1">
//                     <Calendar className="h-4 w-4" />
//                     <span className="text-sm">
//                       {format(new Date(task.dueDate), 'MMM dd, yyyy')}
//                     </span>
//                   </div>
//                 </div>
//               )}
              
//               {task.solveDate && (
//                 <div>
//                   <label className="text-sm font-medium text-muted-foreground">Solve Date</label>
//                   <div className="flex items-center gap-1 mt-1">
//                     <Calendar className="h-4 w-4" />
//                     <span className="text-sm">
//                       {format(new Date(task.solveDate), 'MMM dd, yyyy')}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
            
//             {/* Description/Comments */}
//             {(task.description || task.comments) && (
//               <div>
//                 <label className="text-sm font-medium text-muted-foreground">Description</label>
//                 <div className="mt-1 p-3 bg-muted/50 rounded-lg">
//                   <p className="text-sm whitespace-pre-wrap">
//                     {task.description || task.comments || 'No description provided'}
//                   </p>
//                 </div>
//               </div>
//             )}
            
//             {/* Additional Information */}
//             {(task.subTask?.name || task.modifyOption?.name || task.reference?.name) && (
//               <div>
//                 <label className="text-sm font-medium text-muted-foreground">Additional Details</label>
//                 <div className="mt-2 space-y-2">
//                   {task.subTask?.name && (
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs text-muted-foreground">Sub Task:</span>
//                       <Badge variant="outline" className="text-xs">{task.subTask.name}</Badge>
//                     </div>
//                   )}
//                   {task.modifyOption?.name && (
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs text-muted-foreground">Modify Option:</span>
//                       <Badge variant="outline" className="text-xs">{task.modifyOption.name}</Badge>
//                     </div>
//                   )}
//                   {task.reference?.name && (
//                     <div className="flex items-center gap-2">
//                       <span className="text-xs text-muted-foreground">Reference:</span>
//                       <Badge variant="outline" className="text-xs">{task.reference.name}</Badge>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
          
//           <div className="flex justify-end gap-2 pt-4 border-t">
//             <Button variant="outline" onClick={() => setShowViewDialog(false)}>
//               Close
//             </Button>
//             <Button onClick={() => {
//               setShowViewDialog(false)
//               handleEdit()
//             }}>
//               <Edit className="h-4 w-4 mr-2" />
//               Edit Task
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle className="flex items-center gap-2">
//               <AlertCircle className="h-5 w-5 text-red-500" />
//               Delete Task
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete "{task.name || task.title}"? 
//               This action cannot be undone and will permanently remove the task and all its data.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction 
//               onClick={handleDelete}
//               className="bg-red-600 hover:bg-red-700"
//               disabled={deleteTaskMutation.isPending}
//             >
//               {deleteTaskMutation.isPending ? (
//                 <>
//                   <Clock className="h-4 w-4 mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 <>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Delete Task
//                 </>
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }




// src/components/tasks/task-action-menu.tsx - COMPLETE FIXED VERSION
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteTask, type Task } from '@/hooks/use-tasks'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Star,
  Copy,
  Flag,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TaskActionMenuProps {
  task: Task
  onEdit: (task: Task) => void
  onView?: (task: Task) => void
  className?: string
}

export function TaskActionMenu({ task, onEdit, onView, className }: TaskActionMenuProps) {
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteTaskMutation = useDeleteTask()

  // ✅ CRITICAL: Stop event propagation
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onEdit(task)
  }

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onView) {
      onView(task)
    } else {
      setShowViewDialog(true)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (window.confirm(`Are you sure you want to delete "${task.name || task.title}"?`)) {
      try {
        await deleteTaskMutation.mutateAsync(task.id)
        toast.success('Task deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete task')
      }
    }
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(`Task: ${task.name || task.title}`)
    toast.success('Task name copied!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Pause className="h-4 w-4" />
      case 'IN_REVIEW':
        return <Eye className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-8 w-8", className)}
            onClick={(e) => e.stopPropagation()} // ✅ CRITICAL: Stop propagation
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Task actions</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* View Task */}
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          {/* Edit Task */}
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Task
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Quick Actions */}
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Task Name
          </DropdownMenuItem>
          
          {task.status !== 'COMPLETED' && (
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              Add to Favorites
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          {/* Delete Task */}
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Task Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              {task.name || task.title}
            </DialogTitle>
            <DialogDescription>
              Task Details and Information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Status and Priority */}
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                <Flag className="h-3 w-3 mr-1" />
                {task.priority} Priority
              </Badge>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Task ID</label>
                  <p className="text-sm font-mono">{task.id}</p>
                </div>
                
                {task.trackingNo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                    <p className="text-sm font-mono">{task.trackingNo}</p>
                  </div>
                )}
                
                {task.module?.name && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Module</label>
                    <p className="text-sm">{task.module.name}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {task.assignee && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{task.assignee.name || task.assignee.email}</span>
                    </div>
                  </div>
                )}
                
                {task.sentBy && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sent By</label>
                    <p className="text-sm">{task.sentBy}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description/Comments */}
            {(task.description || task.comments) && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {task.description || task.comments || 'No description provided'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewDialog(false)
              handleEdit(new MouseEvent('click') as any)
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}