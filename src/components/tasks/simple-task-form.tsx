// // src/components/tasks/simple-task-form.tsx - FIXED POSITIONING & PERFORMANCE
// 'use client'

// import { useState, useCallback } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { Calendar } from '@/components/ui/calendar'
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover'
// import { useCreateTask } from '@/hooks/use-tasks'
// import { useUsers } from '@/hooks/use-users'
// import { format } from 'date-fns'
// import { CalendarIcon, Loader2, User, Flag, Calendar as CalIcon, AlertCircle } from 'lucide-react'
// import { cn } from '@/lib/utils'
// import { toast } from 'sonner'

// interface SimpleTaskFormProps {
//   isOpen: boolean
//   onClose: () => void
// }

// const priorities = [
//   { value: 'LOW', label: 'Low', color: 'text-green-600' },
//   { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
//   { value: 'HIGH', label: 'High', color: 'text-orange-600' },
//   { value: 'URGENT', label: 'Urgent', color: 'text-red-600' }
// ] as const

// const statuses = [
//   { value: 'TODO', label: 'To Do' },
//   { value: 'IN_PROGRESS', label: 'In Progress' },
//   { value: 'IN_REVIEW', label: 'In Review' },
//   { value: 'COMPLETED', label: 'Completed' }
// ] as const

// export function SimpleTaskForm({ isOpen, onClose }: SimpleTaskFormProps) {
//   const [formData, setFormData] = useState({
//     taskName: '',
//     assigneeId: '',
//     priority: 'MEDIUM' as const,
//     startDate: undefined as Date | undefined,
//     dueDate: undefined as Date | undefined,
//     status: 'TODO' as const,
//     description: ''
//   })

//   const [startDateOpen, setStartDateOpen] = useState(false)
//   const [dueDateOpen, setDueDateOpen] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const createTaskMutation = useCreateTask()
//   const { data: users, isLoading: usersLoading } = useUsers()

//   const resetForm = useCallback(() => {
//     setFormData({
//       taskName: '',
//       assigneeId: '',
//       priority: 'MEDIUM',
//       startDate: undefined,
//       dueDate: undefined,
//       status: 'TODO',
//       description: ''
//     })
//   }, [])

//   const handleSubmit = useCallback(async () => {
//     if (!formData.taskName.trim()) {
//       toast.error('Task name is required')
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       const taskData = {
//         title: formData.taskName,
//         name: formData.taskName,
//         description: formData.description || undefined,
//         assigneeId: formData.assigneeId === 'unassigned' ? undefined : formData.assigneeId || undefined,
//         priority: formData.priority,
//         status: formData.status,
//         date: formData.startDate?.toISOString(),
//         dueDate: formData.dueDate?.toISOString(),
//       }

//       await createTaskMutation.mutateAsync(taskData)
      
//       toast.success('Task created successfully!')
//       resetForm()
//       onClose()
//     } catch (error) {
//       console.error('Failed to create task:', error)
//       toast.error('Failed to create task. Please try again.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }, [formData, createTaskMutation, resetForm, onClose])

//   const handleClose = useCallback(() => {
//     if (!isSubmitting) {
//       resetForm()
//       onClose()
//     }
//   }, [isSubmitting, resetForm, onClose])

//   const isLoading = createTaskMutation.isPending || isSubmitting

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
//         <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
//           <DialogTitle className="flex items-center gap-2 text-xl">
//             <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
//               <User className="h-4 w-4 text-white" />
//             </div>
//             Create New Task
//           </DialogTitle>
//         </DialogHeader>
        
//         <div className="space-y-6 py-2">
//           {/* Task Name */}
//           <div className="space-y-2">
//             <Label htmlFor="taskName" className="text-sm font-medium">
//               Task Name <span className="text-red-500">*</span>
//             </Label>
//             <Input
//               id="taskName"
//               placeholder="Enter task name..."
//               value={formData.taskName}
//               onChange={(e) => setFormData(prev => ({...prev, taskName: e.target.value}))}
//               disabled={isLoading}
//               className="h-11"
//             />
//           </div>

//           {/* Assignee and Priority Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label className="text-sm font-medium flex items-center gap-1">
//                 <User className="h-4 w-4" />
//                 Assignee
//               </Label>
//               <Select 
//                 value={formData.assigneeId} 
//                 onValueChange={(value) => setFormData(prev => ({...prev, assigneeId: value}))}
//                 disabled={isLoading || usersLoading}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue placeholder={usersLoading ? "Loading..." : "Select assignee"} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="unassigned">Unassigned</SelectItem>
//                   {users?.map(user => (
//                     <SelectItem key={user.id} value={user.id}>
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 bg-green-500 rounded-full" />
//                         {user.name}
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {usersLoading && (
//                 <p className="text-xs text-muted-foreground flex items-center gap-1">
//                   <Loader2 className="h-3 w-3 animate-spin" />
//                   Loading users...
//                 </p>
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <Label className="text-sm font-medium flex items-center gap-1">
//                 <Flag className="h-4 w-4" />
//                 Priority
//               </Label>
//               <Select 
//                 value={formData.priority} 
//                 onValueChange={(value) => setFormData(prev => ({...prev, priority: value as any}))}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className="h-11">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {priorities.map(priority => (
//                     <SelectItem key={priority.value} value={priority.value}>
//                       <div className="flex items-center gap-2">
//                         <div className={cn("w-2 h-2 rounded-full", 
//                           priority.value === 'URGENT' ? 'bg-red-500' :
//                           priority.value === 'HIGH' ? 'bg-orange-500' :
//                           priority.value === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
//                         )} />
//                         <span className={priority.color}>{priority.label}</span>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Dates Row */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label className="text-sm font-medium flex items-center gap-1">
//                 <CalIcon className="h-4 w-4" />
//                 Start Date
//               </Label>
//               <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal h-11",
//                       !formData.startDate && "text-muted-foreground"
//                     )}
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {formData.startDate ? format(formData.startDate, "PPP") : "Select start date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={formData.startDate}
//                     onSelect={(date) => {
//                       setFormData(prev => ({ ...prev, startDate: date }))
//                       setStartDateOpen(false)
//                     }}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
            
//             <div className="space-y-2">
//               <Label className="text-sm font-medium flex items-center gap-1">
//                 <CalendarIcon className="h-4 w-4" />
//                 Due Date
//               </Label>
//               <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal h-11",
//                       !formData.dueDate && "text-muted-foreground"
//                     )}
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={formData.dueDate}
//                     onSelect={(date) => {
//                       setFormData(prev => ({ ...prev, dueDate: date }))
//                       setDueDateOpen(false)
//                     }}
//                     disabled={(date) =>
//                       formData.startDate ? date < formData.startDate : false
//                     }
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//               {formData.startDate && formData.dueDate && formData.dueDate < formData.startDate && (
//                 <p className="text-xs text-red-600 flex items-center gap-1">
//                   <AlertCircle className="h-3 w-3" />
//                   Due date cannot be before start date
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Status */}
//           <div className="space-y-2">
//             <Label className="text-sm font-medium">Status</Label>
//             <Select 
//               value={formData.status} 
//               onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}
//               disabled={isLoading}
//             >
//               <SelectTrigger className="h-11">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 {statuses.map(status => (
//                   <SelectItem key={status.value} value={status.value}>
//                     <div className="flex items-center gap-2">
//                       <div className={cn("w-2 h-2 rounded-full",
//                         status.value === 'COMPLETED' ? 'bg-green-500' :
//                         status.value === 'IN_PROGRESS' ? 'bg-blue-500' :
//                         status.value === 'IN_REVIEW' ? 'bg-purple-500' : 'bg-gray-500'
//                       )} />
//                       {status.label}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description" className="text-sm font-medium">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Enter task description..."
//               value={formData.description}
//               onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
//               disabled={isLoading}
//               rows={3}
//               className="resize-none"
//             />
//           </div>
//         </div>
        
//         <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleClose}
//             disabled={isLoading}
//           >
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleSubmit}
//             disabled={!formData.taskName.trim() || isLoading || (formData.startDate && formData.dueDate && formData.dueDate < formData.startDate)}
//             className="min-w-[120px]"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating...
//               </>
//             ) : (
//               'Create Task'
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }




// src/components/tasks/simple-task-form.tsx - COMPLETE REPLACEMENT FILE
'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useCreateTask, useUpdateTask, type Task } from '@/hooks/use-tasks'
import { useUsers } from '@/hooks/use-users'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, User, Flag, Calendar as CalIcon, AlertCircle, Edit, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SimpleTaskFormProps {
  isOpen: boolean
  onClose: () => void
  task?: Task // Support for editing
  mode?: 'create' | 'edit' // Mode prop
}

const priorities = [
  { value: 'LOW', label: 'Low', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600' }
] as const

const statuses = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' }
] as const

export function SimpleTaskForm({ isOpen, onClose, task, mode = 'create' }: SimpleTaskFormProps) {
  const [formData, setFormData] = useState({
    taskName: '',
    assigneeId: '',
    priority: 'MEDIUM' as const,
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    status: 'TODO' as const,
    description: ''
  })

  const [startDateOpen, setStartDateOpen] = useState(false)
  const [dueDateOpen, setDueDateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const { data: users, isLoading: usersLoading } = useUsers()

  // Pre-fill form when editing
  useEffect(() => {
    if (mode === 'edit' && task) {
      console.log('Pre-filling simple form with task data:', task)
      setFormData({
        taskName: task.name || task.title || '',
        assigneeId: task.assigneeId || '',
        priority: (task.priority || 'MEDIUM') as any,
        startDate: task.date ? new Date(task.date) : undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        status: (task.status || 'TODO') as any,
        description: task.description || task.comments || ''
      })
    } else if (mode === 'create') {
      resetForm()
    }
  }, [task, mode, isOpen])

  const resetForm = useCallback(() => {
    setFormData({
      taskName: '',
      assigneeId: '',
      priority: 'MEDIUM',
      startDate: undefined,
      dueDate: undefined,
      status: 'TODO',
      description: ''
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!formData.taskName.trim()) {
      toast.error('Task name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const taskData = {
        title: formData.taskName,
        name: formData.taskName,
        description: formData.description || undefined,
        assigneeId: formData.assigneeId === 'unassigned' ? undefined : formData.assigneeId || undefined,
        priority: formData.priority,
        status: formData.status,
        date: formData.startDate?.toISOString(),
        dueDate: formData.dueDate?.toISOString(),
      }

      if (mode === 'edit' && task) {
        // UPDATE EXISTING TASK
        await updateTaskMutation.mutateAsync({
          id: task.id,
          data: taskData
        })
        toast.success('Task updated successfully!')
      } else {
        // CREATE NEW TASK
        await createTaskMutation.mutateAsync(taskData)
        toast.success('Task created successfully!')
      }
      
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      toast.error(`Failed to ${mode} task. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, createTaskMutation, updateTaskMutation, resetForm, onClose, mode, task])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      if (mode === 'create') {
        resetForm()
      }
      onClose()
    }
  }, [isSubmitting, resetForm, onClose, mode])

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending || isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              {mode === 'edit' ? <Edit className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
            </div>
            {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
            {mode === 'edit' && (
              <Badge variant="outline" className="ml-2">
                Quick Edit
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-medium">
              Task Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="taskName"
              placeholder="Enter task name..."
              value={formData.taskName}
              onChange={(e) => setFormData(prev => ({...prev, taskName: e.target.value}))}
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* Assignee and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                Assignee
              </Label>
              <Select 
                value={formData.assigneeId} 
                onValueChange={(value) => setFormData(prev => ({...prev, assigneeId: value}))}
                disabled={isLoading || usersLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={usersLoading ? "Loading..." : "Select assignee"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-500" />
                      </div>
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {users?.users?.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        {user.status === 'ACTIVE' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {usersLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading users...
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Flag className="h-4 w-4" />
                Priority
              </Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({...prev, priority: value as any}))}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", 
                          priority.value === 'URGENT' ? 'bg-red-500' :
                          priority.value === 'HIGH' ? 'bg-orange-500' :
                          priority.value === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        )} />
                        <span className={priority.color}>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <CalIcon className="h-4 w-4" />
                Start Date
              </Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !formData.startDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, startDate: date }))
                      setStartDateOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Due Date
              </Label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, dueDate: date }))
                      setDueDateOpen(false)
                    }}
                    disabled={(date) =>
                      formData.startDate ? date < formData.startDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.startDate && formData.dueDate && formData.dueDate < formData.startDate && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Due date cannot be before start date
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full",
                        status.value === 'COMPLETED' ? 'bg-green-500' :
                        status.value === 'IN_PROGRESS' ? 'bg-blue-500' :
                        status.value === 'IN_REVIEW' ? 'bg-purple-500' : 'bg-gray-500'
                      )} />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Edit Mode Indicator */}
          {mode === 'edit' && task && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">Editing Task</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                You're editing: {task.title || task.name}
              </p>
              <p className="text-xs text-blue-600">
                Created: {task.createdAt ? format(new Date(task.createdAt), 'MMM dd, yyyy') : 'Unknown'}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.taskName.trim() || isLoading || (formData.startDate && formData.dueDate && formData.dueDate < formData.startDate)}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{mode === 'edit' ? 'Update Task' : 'Create Task'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}