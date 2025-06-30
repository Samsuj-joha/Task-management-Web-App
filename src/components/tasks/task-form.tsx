// // src/components/tasks/task-form.tsx
// 'use client'

// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
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
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { Badge } from '@/components/ui/badge'
// import { useCreateTask, useUpdateTask, type CreateTaskData, type Task } from '@/hooks/use-tasks'
// import { format } from 'date-fns'
// import { 
//   Calendar as CalendarIcon, 
//   Loader2, 
//   Plus,
//   X,
//   AlertTriangle,
//   Clock,
//   Target,
//   Building2,
//   Settings,
//   FileText,
//   Users,
//   Hash
// } from 'lucide-react'
// import { cn } from '@/lib/utils'

// interface TaskFormProps {
//   isOpen: boolean
//   onClose: () => void
//   task?: Task // For editing existing task
//   mode?: 'create' | 'edit'
// }

// const priorityOptions = [
//   { value: 'LOW', label: 'Low Priority', color: 'bg-green-500', icon: '🟢' },
//   { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-500', icon: '🟡' },
//   { value: 'HIGH', label: 'High Priority', color: 'bg-orange-500', icon: '🟠' },
//   { value: 'URGENT', label: 'Urgent Priority', color: 'bg-red-500', icon: '🔴' },
// ]

// const statusOptions = [
//   { value: 'TODO', label: 'To Do', icon: Clock },
//   { value: 'IN_PROGRESS', label: 'In Progress', icon: Settings },
//   { value: 'IN_REVIEW', label: 'In Review', icon: FileText },
//   { value: 'COMPLETED', label: 'Completed', icon: Target },
//   { value: 'CANCELLED', label: 'Cancelled', icon: X },
// ]

// const moduleOptions = [
//   'Frontend Development',
//   'Backend Development', 
//   'Database Management',
//   'UI/UX Design',
//   'Quality Assurance',
//   'DevOps & Deployment',
//   'Mobile Development',
//   'API Development',
//   'System Integration',
//   'Documentation'
// ]

// const taskTypeOptions = [
//   'Bug Fix',
//   'Feature Development',
//   'Enhancement',
//   'Research',
//   'Testing',
//   'Code Review',
//   'Documentation',
//   'Deployment',
//   'Maintenance',
//   'Support'
// ]

// const departmentOptions = [
//   'Frontend Team',
//   'Backend Team',
//   'Full Stack Team',
//   'Mobile Team',
//   'DevOps Team',
//   'QA Team',
//   'UI/UX Team',
//   'Product Team',
//   'Data Team',
//   'Security Team'
// ]

// export function TaskForm({ isOpen, onClose, task, mode = 'create' }: TaskFormProps) {
//   const [formData, setFormData] = useState({
//     name: task?.name || '',
//     date: task?.date ? new Date(task.date) : new Date(),
//     module: task?.module || '',
//     devDept: task?.devDept || '',
//     taskType: task?.taskType || '',
//     subTask: task?.subTask || '',
//     modify: task?.modify || '',
//     reference: task?.reference || '',
//     trackingNo: task?.trackingNo || '',
//     status: (task?.status || 'TODO') as CreateTaskData['status'],
//     solveDate: task?.solveDate ? new Date(task.solveDate) : undefined,
//     sentBy: task?.sentBy || '',
//     comments: task?.comments || '',
//     priority: (task?.priority || 'MEDIUM') as CreateTaskData['priority'],
//     dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
//     tags: [] as string[]
//   })
//   const [tagInput, setTagInput] = useState('')
//   const [datePickerOpen, setDatePickerOpen] = useState(false)
//   const [solveDatePickerOpen, setSolveDatePickerOpen] = useState(false)
//   const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)

//   const createTaskMutation = useCreateTask()
//   const updateTaskMutation = useUpdateTask()

//   const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!formData.name.trim()) {
//       return // Name is required
//     }

//     try {
//       const taskData: CreateTaskData = {
//         name: formData.name.trim(),
//         date: formData.date?.toISOString(),
//         module: formData.module || undefined,
//         devDept: formData.devDept || undefined,
//         taskType: formData.taskType || undefined,
//         subTask: formData.subTask.trim() || undefined,
//         modify: formData.modify.trim() || undefined,
//         reference: formData.reference.trim() || undefined,
//         trackingNo: formData.trackingNo.trim() || undefined,
//         status: formData.status,
//         solveDate: formData.solveDate?.toISOString(),
//         sentBy: formData.sentBy.trim() || undefined,
//         comments: formData.comments.trim() || undefined,
//         priority: formData.priority,
//         dueDate: formData.dueDate?.toISOString(),
//         tags: formData.tags.length > 0 ? formData.tags : undefined,
//       }

//       if (mode === 'edit' && task) {
//         await updateTaskMutation.mutateAsync({
//           id: task.id,
//           data: taskData
//         })
//       } else {
//         await createTaskMutation.mutateAsync(taskData)
//       }

//       onClose()
//       resetForm()
//     } catch (error) {
//       // Error is handled by the mutation hooks
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       date: new Date(),
//       module: '',
//       devDept: '',
//       taskType: '',
//       subTask: '',
//       modify: '',
//       reference: '',
//       trackingNo: '',
//       status: 'TODO',
//       solveDate: undefined,
//       sentBy: '',
//       comments: '',
//       priority: 'MEDIUM',
//       dueDate: undefined,
//       tags: []
//     })
//     setTagInput('')
//   }

//   const handleAddTag = () => {
//     const tag = tagInput.trim()
//     if (tag && !formData.tags.includes(tag)) {
//       setFormData(prev => ({
//         ...prev,
//         tags: [...prev.tags, tag]
//       }))
//       setTagInput('')
//     }
//   }

//   const handleRemoveTag = (tagToRemove: string) => {
//     setFormData(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove)
//     }))
//   }

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault()
//       handleAddTag()
//     }
//   }

//   const handleClose = () => {
//     if (!isLoading) {
//       onClose()
//       if (mode === 'create') {
//         resetForm()
//       }
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2 text-xl">
//             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
//               <FileText className="h-5 w-5 text-primary-foreground" />
//             </div>
//             <div>
//               <span className="text-primary font-bold">TaskFlow</span>
//               <span className="text-muted-foreground text-sm ml-2">Task Management</span>
//             </div>
//           </DialogTitle>
//           <DialogDescription>
//             {mode === 'edit' 
//               ? 'Update the task details in the form below.'
//               : 'Fill out the form below to create a new task in the system.'
//             }
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* First Row */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Name */}
//             <div className="space-y-2">
//               <Label htmlFor="name" className="text-sm font-medium text-blue-700">
//                 Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="name"
//                 placeholder="Enter task name..."
//                 value={formData.name}
//                 onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                 required
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>

//             {/* Date */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Date</Label>
//               <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal bg-blue-50/50",
//                       !formData.date && "text-muted-foreground"
//                     )}
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {formData.date ? format(formData.date, "PPP") : "Select date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={formData.date}
//                     onSelect={(date) => {
//                       setFormData(prev => ({ ...prev, date: date || new Date() }))
//                       setDatePickerOpen(false)
//                     }}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>

//             {/* Module */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Module</Label>
//               <Select
//                 value={formData.module}
//                 onValueChange={(value) => setFormData(prev => ({ ...prev, module: value }))}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className="bg-blue-50/50">
//                   <SelectValue placeholder="Select module" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {moduleOptions.map((module) => (
//                     <SelectItem key={module} value={module}>
//                       {module}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Second Row */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Dev/Dept */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Dev/Dept</Label>
//               <Select
//                 value={formData.devDept}
//                 onValueChange={(value) => setFormData(prev => ({ ...prev, devDept: value }))}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className="bg-blue-50/50">
//                   <SelectValue placeholder="Select department" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {departmentOptions.map((dept) => (
//                     <SelectItem key={dept} value={dept}>
//                       {dept}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Task Type */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Task Type</Label>
//               <Select
//                 value={formData.taskType}
//                 onValueChange={(value) => setFormData(prev => ({ ...prev, taskType: value }))}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className="bg-blue-50/50">
//                   <SelectValue placeholder="Select task type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {taskTypeOptions.map((type) => (
//                     <SelectItem key={type} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Sub Task */}
//             <div className="space-y-2">
//               <Label htmlFor="subTask" className="text-sm font-medium text-blue-700">Sub Task</Label>
//               <Input
//                 id="subTask"
//                 placeholder="Enter sub task..."
//                 value={formData.subTask}
//                 onChange={(e) => setFormData(prev => ({ ...prev, subTask: e.target.value }))}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>
//           </div>

//           {/* Third Row */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Modify */}
//             <div className="space-y-2">
//               <Label htmlFor="modify" className="text-sm font-medium text-blue-700">Modify</Label>
//               <Input
//                 id="modify"
//                 placeholder="Enter modification details..."
//                 value={formData.modify}
//                 onChange={(e) => setFormData(prev => ({ ...prev, modify: e.target.value }))}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>

//             {/* Reference */}
//             <div className="space-y-2">
//               <Label htmlFor="reference" className="text-sm font-medium text-blue-700">Reference</Label>
//               <Input
//                 id="reference"
//                 placeholder="Enter reference..."
//                 value={formData.reference}
//                 onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>

//             {/* Tracking No */}
//             <div className="space-y-2">
//               <Label htmlFor="trackingNo" className="text-sm font-medium text-blue-700">Tracking No</Label>
//               <Input
//                 id="trackingNo"
//                 placeholder="Enter tracking number..."
//                 value={formData.trackingNo}
//                 onChange={(e) => setFormData(prev => ({ ...prev, trackingNo: e.target.value }))}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>
//           </div>

//           {/* Fourth Row */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Status */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value) => setFormData(prev => ({ 
//                   ...prev, 
//                   status: value as CreateTaskData['status'] 
//                 }))}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className="bg-blue-50/50">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {statusOptions.map((option) => {
//                     const Icon = option.icon
//                     return (
//                       <SelectItem key={option.value} value={option.value}>
//                         <div className="flex items-center gap-2">
//                           <Icon className="h-4 w-4" />
//                           {option.label}
//                         </div>
//                       </SelectItem>
//                     )
//                   })}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Solve Date */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Solve Date</Label>
//               <Popover open={solveDatePickerOpen} onOpenChange={setSolveDatePickerOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal bg-blue-50/50",
//                       !formData.solveDate && "text-muted-foreground"
//                     )}
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {formData.solveDate ? format(formData.solveDate, "PPP") : "Select solve date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={formData.solveDate}
//                     onSelect={(date) => {
//                       setFormData(prev => ({ ...prev, solveDate: date }))
//                       setSolveDatePickerOpen(false)
//                     }}
//                     initialFocus
//                   />
//                   {formData.solveDate && (
//                     <div className="p-3 border-t">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="w-full"
//                         onClick={() => {
//                           setFormData(prev => ({ ...prev, solveDate: undefined }))
//                           setSolveDatePickerOpen(false)
//                         }}
//                       >
//                         Clear Date
//                       </Button>
//                     </div>
//                   )}
//                 </PopoverContent>
//               </Popover>
//             </div>

//             {/* Sent By */}
//             <div className="space-y-2">
//               <Label htmlFor="sentBy" className="text-sm font-medium text-blue-700">Sent By</Label>
//               <Input
//                 id="sentBy"
//                 placeholder="Enter sender name..."
//                 value={formData.sentBy}
//                 onChange={(e) => setFormData(prev => ({ ...prev, sentBy: e.target.value }))}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>
//           </div>

//           {/* Fifth Row - Priority and Due Date */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Priority */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Priority Level</Label>
//               <Select
//                 value={formData.priority}
//                 onValueChange={(value) => setFormData(prev => ({ 
//                   ...prev, 
//                   priority: value as CreateTaskData['priority'] 
//                 }))}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger className="bg-blue-50/50">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {priorityOptions.map((option) => (
//                     <SelectItem key={option.value} value={option.value}>
//                       <div className="flex items-center gap-2">
//                         <span>{option.icon}</span>
//                         <span>{option.label}</span>
//                       </div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Due Date */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Due Date</Label>
//               <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className={cn(
//                       "w-full justify-start text-left font-normal bg-blue-50/50",
//                       !formData.dueDate && "text-muted-foreground"
//                     )}
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={formData.dueDate}
//                     onSelect={(date) => {
//                       setFormData(prev => ({ ...prev, dueDate: date }))
//                       setDueDatePickerOpen(false)
//                     }}
//                     disabled={(date) =>
//                       date < new Date(new Date().setHours(0, 0, 0, 0))
//                     }
//                     initialFocus
//                   />
//                   {formData.dueDate && (
//                     <div className="p-3 border-t">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="w-full"
//                         onClick={() => {
//                           setFormData(prev => ({ ...prev, dueDate: undefined }))
//                           setDueDatePickerOpen(false)
//                         }}
//                       >
//                         Clear Date
//                       </Button>
//                     </div>
//                   )}
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//           {/* Comments */}
//           <div className="space-y-2">
//             <Label htmlFor="comments" className="text-sm font-medium text-blue-700">Comments</Label>
//             <Textarea
//               id="comments"
//               placeholder="Enter comments or additional details..."
//               value={formData.comments}
//               onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
//               rows={4}
//               disabled={isLoading}
//               className="bg-blue-50/50"
//             />
//           </div>

//           {/* Tags */}
//           <div className="space-y-2">
//             <Label className="text-sm font-medium text-blue-700">Tags (Optional)</Label>
//             <div className="flex gap-2">
//               <Input
//                 placeholder="Add tag..."
//                 value={tagInput}
//                 onChange={(e) => setTagInput(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//               <Button
//                 type="button"
//                 variant="outline"
//                 size="icon"
//                 onClick={handleAddTag}
//                 disabled={!tagInput.trim() || isLoading}
//               >
//                 <Plus className="h-4 w-4" />
//               </Button>
//             </div>
            
//             {formData.tags.length > 0 && (
//               <div className="flex flex-wrap gap-2 pt-2">
//                 {formData.tags.map((tag) => (
//                   <Badge key={tag} variant="secondary" className="gap-1">
//                     {tag}
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="icon"
//                       className="h-3 w-3 p-0 hover:bg-transparent"
//                       onClick={() => handleRemoveTag(tag)}
//                       disabled={isLoading}
//                     >
//                       <X className="h-2 w-2" />
//                     </Button>
//                   </Badge>
//                 ))}
//               </div>
//             )}
//           </div>

//           <DialogFooter className="gap-2 pt-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handleClose}
//               disabled={isLoading}
//             >
//               Cancel
//             </Button>
//             <Button 
//               type="submit" 
//               disabled={!formData.name.trim() || isLoading}
//               className="bg-blue-600 hover:bg-blue-700"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   {mode === 'edit' ? 'Updating...' : 'Creating...'}
//                 </>
//               ) : (
//                 <>
//                   {mode === 'edit' ? 'Update Task' : 'Submit'}
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }



// src/components/tasks/task-form.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useCreateTask, useUpdateTask, type CreateTaskData, type Task } from '@/hooks/use-tasks'
import { useLookups } from '@/hooks/use-lookups'
import { format } from 'date-fns'
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  Plus,
  X,
  AlertTriangle,
  Clock,
  Target,
  Building2,
  Settings,
  FileText,
  Users,
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  task?: Task // For editing existing task
  mode?: 'create' | 'edit'
}

const priorityOptions = [
  { value: 'LOW', label: 'Low Priority', color: 'bg-green-500', icon: '🟢' },
  { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-500', icon: '🟡' },
  { value: 'HIGH', label: 'High Priority', color: 'bg-orange-500', icon: '🟠' },
  { value: 'URGENT', label: 'Urgent Priority', color: 'bg-red-500', icon: '🔴' },
]

const statusOptions = [
  { value: 'TODO', label: 'To Do', icon: Clock },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: Settings },
  { value: 'IN_REVIEW', label: 'In Review', icon: FileText },
  { value: 'COMPLETED', label: 'Completed', icon: Target },
  { value: 'CANCELLED', label: 'Cancelled', icon: X },
]

export function TaskForm({ isOpen, onClose, task, mode = 'create' }: TaskFormProps) {
  // Fetch dynamic lookup data
  const { data: lookups, isLoading: lookupsLoading } = useLookups()
  
  const [formData, setFormData] = useState({
    name: task?.name || '',
    date: task?.date ? new Date(task.date) : new Date(),
    moduleId: task?.moduleId || '',
    devDeptId: task?.devDeptId || '',
    taskTypeId: task?.taskTypeId || '',
    subTaskId: task?.subTaskId || '',
    modifyId: task?.modifyId || '',
    referenceId: task?.referenceId || '',
    trackingNo: task?.trackingNo || '',
    status: (task?.status || 'TODO') as CreateTaskData['status'],
    solveDate: task?.solveDate ? new Date(task.solveDate) : undefined,
    sentBy: task?.sentBy || '',
    comments: task?.comments || '',
    priority: (task?.priority || 'MEDIUM') as CreateTaskData['priority'],
    dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
    tags: [] as string[]
  })
  
  const [tagInput, setTagInput] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [solveDatePickerOpen, setSolveDatePickerOpen] = useState(false)
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

  // Filter sub tasks based on selected task type
  const filteredSubTasks = lookups?.subTasks?.filter(subTask => 
    !formData.taskTypeId || !subTask.taskTypeId || subTask.taskTypeId === formData.taskTypeId
  ) || []

  // Reset sub task when task type changes
  useEffect(() => {
    if (formData.taskTypeId && formData.subTaskId) {
      const currentSubTask = lookups?.subTasks?.find(st => st.id === formData.subTaskId)
      if (currentSubTask && currentSubTask.taskTypeId && currentSubTask.taskTypeId !== formData.taskTypeId) {
        setFormData(prev => ({ ...prev, subTaskId: '' }))
      }
    }
  }, [formData.taskTypeId, formData.subTaskId, lookups?.subTasks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return // Name is required
    }

    try {
      const taskData: CreateTaskData = {
        name: formData.name.trim(),
        date: formData.date?.toISOString(),
        moduleId: formData.moduleId || undefined,
        devDeptId: formData.devDeptId || undefined,
        taskTypeId: formData.taskTypeId || undefined,
        subTaskId: formData.subTaskId || undefined,
        modifyId: formData.modifyId || undefined,
        referenceId: formData.referenceId || undefined,
        trackingNo: formData.trackingNo.trim() || undefined,
        status: formData.status,
        solveDate: formData.solveDate?.toISOString(),
        sentBy: formData.sentBy.trim() || undefined,
        comments: formData.comments.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate?.toISOString(),
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      }

      if (mode === 'edit' && task) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          data: taskData
        })
      } else {
        await createTaskMutation.mutateAsync(taskData)
      }

      onClose()
      resetForm()
    } catch (error) {
      // Error is handled by the mutation hooks
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date(),
      moduleId: '',
      devDeptId: '',
      taskTypeId: '',
      subTaskId: '',
      modifyId: '',
      referenceId: '',
      trackingNo: '',
      status: 'TODO',
      solveDate: undefined,
      sentBy: '',
      comments: '',
      priority: 'MEDIUM',
      dueDate: undefined,
      tags: []
    })
    setTagInput('')
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      if (mode === 'create') {
        resetForm()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-primary font-bold">TaskFlow</span>
              <span className="text-muted-foreground text-sm ml-2">Task Management</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit' 
              ? 'Update the task details in the form below.'
              : 'Fill out the form below to create a new task in the system.'
            }
          </DialogDescription>
        </DialogHeader>

        {lookupsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading form data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-blue-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter task name..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="bg-blue-50/50"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-blue-50/50",
                        !formData.date && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, date: date || new Date() }))
                        setDatePickerOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Module - Dynamic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">
                  Module
                  {!lookups?.modules?.length && (
                    <span className="text-xs text-muted-foreground ml-1">(No modules available)</span>
                  )}
                </Label>
                <Select
                  value={formData.moduleId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}
                  disabled={isLoading || !lookups?.modules?.length}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder={lookups?.modules?.length ? "Select module" : "No modules available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups?.modules?.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dev/Dept - Dynamic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">
                  Dev/Dept
                  {!lookups?.departments?.length && (
                    <span className="text-xs text-muted-foreground ml-1">(No departments available)</span>
                  )}
                </Label>
                <Select
                  value={formData.devDeptId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, devDeptId: value }))}
                  disabled={isLoading || !lookups?.departments?.length}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder={lookups?.departments?.length ? "Select department" : "No departments available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups?.departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task Type - Dynamic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">
                  Task Type
                  {!lookups?.taskTypes?.length && (
                    <span className="text-xs text-muted-foreground ml-1">(No task types available)</span>
                  )}
                </Label>
                <Select
                  value={formData.taskTypeId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, taskTypeId: value, subTaskId: '' }))}
                  disabled={isLoading || !lookups?.taskTypes?.length}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder={lookups?.taskTypes?.length ? "Select task type" : "No task types available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups?.taskTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Task - Dynamic (filtered by task type) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">
                  Sub Task
                  {!filteredSubTasks.length && formData.taskTypeId && (
                    <span className="text-xs text-muted-foreground ml-1">(No sub tasks for selected type)</span>
                  )}
                  {!formData.taskTypeId && (
                    <span className="text-xs text-muted-foreground ml-1">(Select task type first)</span>
                  )}
                </Label>
                <Select
                  value={formData.subTaskId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subTaskId: value }))}
                  disabled={isLoading || !filteredSubTasks.length}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder={
                      !formData.taskTypeId 
                        ? "Select task type first" 
                        : filteredSubTasks.length 
                          ? "Select sub task" 
                          : "No sub tasks available"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubTasks.map((subTask) => (
                      <SelectItem key={subTask.id} value={subTask.id}>
                        {subTask.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Modify - Dynamic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">
                  Modify
                  {!lookups?.modifyOptions?.length && (
                    <span className="text-xs text-muted-foreground ml-1">(No modify options available)</span>
                  )}
                </Label>
                <Select
                  value={formData.modifyId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, modifyId: value }))}
                  disabled={isLoading || !lookups?.modifyOptions?.length}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder={lookups?.modifyOptions?.length ? "Select modification" : "No modify options available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups?.modifyOptions?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reference - Dynamic */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">
                  Reference
                  {!lookups?.references?.length && (
                    <span className="text-xs text-muted-foreground ml-1">(No references available)</span>
                  )}
                </Label>
                <Select
                  value={formData.referenceId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, referenceId: value }))}
                  disabled={isLoading || !lookups?.references?.length}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue placeholder={lookups?.references?.length ? "Select reference" : "No references available"} />
                  </SelectTrigger>
                  <SelectContent>
                    {lookups?.references?.map((reference) => (
                      <SelectItem key={reference.id} value={reference.id}>
                        {reference.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tracking No */}
              <div className="space-y-2">
                <Label htmlFor="trackingNo" className="text-sm font-medium text-blue-700">Tracking No</Label>
                <Input
                  id="trackingNo"
                  placeholder="Enter tracking number..."
                  value={formData.trackingNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingNo: e.target.value }))}
                  disabled={isLoading}
                  className="bg-blue-50/50"
                />
              </div>
            </div>

            {/* Fourth Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    status: value as CreateTaskData['status'] 
                  }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Solve Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Solve Date</Label>
                <Popover open={solveDatePickerOpen} onOpenChange={setSolveDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-blue-50/50",
                        !formData.solveDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.solveDate ? format(formData.solveDate, "PPP") : "Select solve date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.solveDate}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, solveDate: date }))
                        setSolveDatePickerOpen(false)
                      }}
                      initialFocus
                    />
                    {formData.solveDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, solveDate: undefined }))
                            setSolveDatePickerOpen(false)
                          }}
                        >
                          Clear Date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Sent By */}
              <div className="space-y-2">
                <Label htmlFor="sentBy" className="text-sm font-medium text-blue-700">Sent By</Label>
                <Input
                  id="sentBy"
                  placeholder="Enter sender name..."
                  value={formData.sentBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, sentBy: e.target.value }))}
                  disabled={isLoading}
                  className="bg-blue-50/50"
                />
              </div>
            </div>

            {/* Fifth Row - Priority and Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    priority: value as CreateTaskData['priority'] 
                  }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-blue-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Due Date</Label>
                <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-blue-50/50",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                      disabled={isLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => {
                        setFormData(prev => ({ ...prev, dueDate: date }))
                        setDueDatePickerOpen(false)
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                    {formData.dueDate && (
                      <div className="p-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, dueDate: undefined }))
                            setDueDatePickerOpen(false)
                          }}
                        >
                          Clear Date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm font-medium text-blue-700">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Enter comments or additional details..."
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                rows={4}
                disabled={isLoading}
                className="bg-blue-50/50"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-700">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="bg-blue-50/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-3 w-3 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isLoading}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Helper text for empty dropdowns */}
            {(!lookups?.modules?.length || !lookups?.departments?.length || !lookups?.taskTypes?.length) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Some dropdown options are empty</span>
                </div>
                <p className="text-amber-700 text-sm mt-1">
                  Go to sidebar → "Form Data" to add options for the dropdown menus.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.name.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {mode === 'edit' ? 'Update Task' : 'Submit'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}