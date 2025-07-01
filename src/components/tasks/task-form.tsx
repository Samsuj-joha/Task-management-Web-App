
// // src/components/tasks/task-form.tsx
// 'use client'

// import { useState, useEffect } from 'react'
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
// import { useLookups } from '@/hooks/use-lookups'
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

// export function TaskForm({ isOpen, onClose, task, mode = 'create' }: TaskFormProps) {
//   // Fetch dynamic lookup data
//   const { data: lookups, isLoading: lookupsLoading } = useLookups()
  
//   const [formData, setFormData] = useState({
//     name: task?.name || '',
//     date: task?.date ? new Date(task.date) : new Date(),
//     moduleId: task?.moduleId || '',
//     devDeptId: task?.devDeptId || '',
//     taskTypeId: task?.taskTypeId || '',
//     subTaskId: task?.subTaskId || '',
//     modifyId: task?.modifyId || '',
//     referenceId: task?.referenceId || '',
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

//   // Filter sub tasks based on selected task type
//   const filteredSubTasks = lookups?.subTasks?.filter(subTask => 
//     !formData.taskTypeId || !subTask.taskTypeId || subTask.taskTypeId === formData.taskTypeId
//   ) || []

//   // Reset sub task when task type changes
//   useEffect(() => {
//     if (formData.taskTypeId && formData.subTaskId) {
//       const currentSubTask = lookups?.subTasks?.find(st => st.id === formData.subTaskId)
//       if (currentSubTask && currentSubTask.taskTypeId && currentSubTask.taskTypeId !== formData.taskTypeId) {
//         setFormData(prev => ({ ...prev, subTaskId: '' }))
//       }
//     }
//   }, [formData.taskTypeId, formData.subTaskId, lookups?.subTasks])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!formData.name.trim()) {
//       return // Name is required
//     }

//     try {
//       const taskData: CreateTaskData = {
//         name: formData.name.trim(),
//         date: formData.date?.toISOString(),
//         moduleId: formData.moduleId || undefined,
//         devDeptId: formData.devDeptId || undefined,
//         taskTypeId: formData.taskTypeId || undefined,
//         subTaskId: formData.subTaskId || undefined,
//         modifyId: formData.modifyId || undefined,
//         referenceId: formData.referenceId || undefined,
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
//       moduleId: '',
//       devDeptId: '',
//       taskTypeId: '',
//       subTaskId: '',
//       modifyId: '',
//       referenceId: '',
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

//         {lookupsLoading ? (
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-6 w-6 animate-spin mr-2" />
//             Loading form data...
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* First Row */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Name */}
//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-sm font-medium text-blue-700">
//                   Name <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="name"
//                   placeholder="Enter task name..."
//                   value={formData.name}
//                   onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
//                   required
//                   disabled={isLoading}
//                   className="bg-blue-50/50"
//                 />
//               </div>

//               {/* Date */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">Date</Label>
//                 <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal bg-blue-50/50",
//                         !formData.date && "text-muted-foreground"
//                       )}
//                       disabled={isLoading}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {formData.date ? format(formData.date, "PPP") : "Select date"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0">
//                     <Calendar
//                       mode="single"
//                       selected={formData.date}
//                       onSelect={(date) => {
//                         setFormData(prev => ({ ...prev, date: date || new Date() }))
//                         setDatePickerOpen(false)
//                       }}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               {/* Module - Dynamic */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">
//                   Module
//                   {!lookups?.modules?.length && (
//                     <span className="text-xs text-muted-foreground ml-1">(No modules available)</span>
//                   )}
//                 </Label>
//                 <Select
//                   value={formData.moduleId}
//                   onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}
//                   disabled={isLoading || !lookups?.modules?.length}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue placeholder={lookups?.modules?.length ? "Select module" : "No modules available"} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {lookups?.modules?.map((module) => (
//                       <SelectItem key={module.id} value={module.id}>
//                         {module.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Second Row */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Dev/Dept - Dynamic */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">
//                   Dev/Dept
//                   {!lookups?.departments?.length && (
//                     <span className="text-xs text-muted-foreground ml-1">(No departments available)</span>
//                   )}
//                 </Label>
//                 <Select
//                   value={formData.devDeptId}
//                   onValueChange={(value) => setFormData(prev => ({ ...prev, devDeptId: value }))}
//                   disabled={isLoading || !lookups?.departments?.length}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue placeholder={lookups?.departments?.length ? "Select department" : "No departments available"} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {lookups?.departments?.map((dept) => (
//                       <SelectItem key={dept.id} value={dept.id}>
//                         {dept.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Task Type - Dynamic */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">
//                   Task Type
//                   {!lookups?.taskTypes?.length && (
//                     <span className="text-xs text-muted-foreground ml-1">(No task types available)</span>
//                   )}
//                 </Label>
//                 <Select
//                   value={formData.taskTypeId}
//                   onValueChange={(value) => setFormData(prev => ({ ...prev, taskTypeId: value, subTaskId: '' }))}
//                   disabled={isLoading || !lookups?.taskTypes?.length}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue placeholder={lookups?.taskTypes?.length ? "Select task type" : "No task types available"} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {lookups?.taskTypes?.map((type) => (
//                       <SelectItem key={type.id} value={type.id}>
//                         {type.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Sub Task - Dynamic (filtered by task type) */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">
//                   Sub Task
//                   {!filteredSubTasks.length && formData.taskTypeId && (
//                     <span className="text-xs text-muted-foreground ml-1">(No sub tasks for selected type)</span>
//                   )}
//                   {!formData.taskTypeId && (
//                     <span className="text-xs text-muted-foreground ml-1">(Select task type first)</span>
//                   )}
//                 </Label>
//                 <Select
//                   value={formData.subTaskId}
//                   onValueChange={(value) => setFormData(prev => ({ ...prev, subTaskId: value }))}
//                   disabled={isLoading || !filteredSubTasks.length}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue placeholder={
//                       !formData.taskTypeId 
//                         ? "Select task type first" 
//                         : filteredSubTasks.length 
//                           ? "Select sub task" 
//                           : "No sub tasks available"
//                     } />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {filteredSubTasks.map((subTask) => (
//                       <SelectItem key={subTask.id} value={subTask.id}>
//                         {subTask.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Third Row */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Modify - Dynamic */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">
//                   Modify
//                   {!lookups?.modifyOptions?.length && (
//                     <span className="text-xs text-muted-foreground ml-1">(No modify options available)</span>
//                   )}
//                 </Label>
//                 <Select
//                   value={formData.modifyId}
//                   onValueChange={(value) => setFormData(prev => ({ ...prev, modifyId: value }))}
//                   disabled={isLoading || !lookups?.modifyOptions?.length}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue placeholder={lookups?.modifyOptions?.length ? "Select modification" : "No modify options available"} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {lookups?.modifyOptions?.map((option) => (
//                       <SelectItem key={option.id} value={option.id}>
//                         {option.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Reference - Dynamic */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">
//                   Reference
//                   {!lookups?.references?.length && (
//                     <span className="text-xs text-muted-foreground ml-1">(No references available)</span>
//                   )}
//                 </Label>
//                 <Select
//                   value={formData.referenceId}
//                   onValueChange={(value) => setFormData(prev => ({ ...prev, referenceId: value }))}
//                   disabled={isLoading || !lookups?.references?.length}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue placeholder={lookups?.references?.length ? "Select reference" : "No references available"} />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {lookups?.references?.map((reference) => (
//                       <SelectItem key={reference.id} value={reference.id}>
//                         {reference.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Tracking No */}
//               <div className="space-y-2">
//                 <Label htmlFor="trackingNo" className="text-sm font-medium text-blue-700">Tracking No</Label>
//                 <Input
//                   id="trackingNo"
//                   placeholder="Enter tracking number..."
//                   value={formData.trackingNo}
//                   onChange={(e) => setFormData(prev => ({ ...prev, trackingNo: e.target.value }))}
//                   disabled={isLoading}
//                   className="bg-blue-50/50"
//                 />
//               </div>
//             </div>

//             {/* Fourth Row */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Status */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">Status</Label>
//                 <Select
//                   value={formData.status}
//                   onValueChange={(value) => setFormData(prev => ({ 
//                     ...prev, 
//                     status: value as CreateTaskData['status'] 
//                   }))}
//                   disabled={isLoading}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {statusOptions.map((option) => {
//                       const Icon = option.icon
//                       return (
//                         <SelectItem key={option.value} value={option.value}>
//                           <div className="flex items-center gap-2">
//                             <Icon className="h-4 w-4" />
//                             {option.label}
//                           </div>
//                         </SelectItem>
//                       )
//                     })}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Solve Date */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">Solve Date</Label>
//                 <Popover open={solveDatePickerOpen} onOpenChange={setSolveDatePickerOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal bg-blue-50/50",
//                         !formData.solveDate && "text-muted-foreground"
//                       )}
//                       disabled={isLoading}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {formData.solveDate ? format(formData.solveDate, "PPP") : "Select solve date"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0">
//                     <Calendar
//                       mode="single"
//                       selected={formData.solveDate}
//                       onSelect={(date) => {
//                         setFormData(prev => ({ ...prev, solveDate: date }))
//                         setSolveDatePickerOpen(false)
//                       }}
//                       initialFocus
//                     />
//                     {formData.solveDate && (
//                       <div className="p-3 border-t">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-full"
//                           onClick={() => {
//                             setFormData(prev => ({ ...prev, solveDate: undefined }))
//                             setSolveDatePickerOpen(false)
//                           }}
//                         >
//                           Clear Date
//                         </Button>
//                       </div>
//                     )}
//                   </PopoverContent>
//                 </Popover>
//               </div>

//               {/* Sent By */}
//               <div className="space-y-2">
//                 <Label htmlFor="sentBy" className="text-sm font-medium text-blue-700">Sent By</Label>
//                 <Input
//                   id="sentBy"
//                   placeholder="Enter sender name..."
//                   value={formData.sentBy}
//                   onChange={(e) => setFormData(prev => ({ ...prev, sentBy: e.target.value }))}
//                   disabled={isLoading}
//                   className="bg-blue-50/50"
//                 />
//               </div>
//             </div>

//             {/* Fifth Row - Priority and Due Date */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Priority */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">Priority Level</Label>
//                 <Select
//                   value={formData.priority}
//                   onValueChange={(value) => setFormData(prev => ({ 
//                     ...prev, 
//                     priority: value as CreateTaskData['priority'] 
//                   }))}
//                   disabled={isLoading}
//                 >
//                   <SelectTrigger className="bg-blue-50/50">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {priorityOptions.map((option) => (
//                       <SelectItem key={option.value} value={option.value}>
//                         <div className="flex items-center gap-2">
//                           <span>{option.icon}</span>
//                           <span>{option.label}</span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Due Date */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-blue-700">Due Date</Label>
//                 <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
//                   <PopoverTrigger asChild>
//                     <Button
//                       variant="outline"
//                       className={cn(
//                         "w-full justify-start text-left font-normal bg-blue-50/50",
//                         !formData.dueDate && "text-muted-foreground"
//                       )}
//                       disabled={isLoading}
//                     >
//                       <CalendarIcon className="mr-2 h-4 w-4" />
//                       {formData.dueDate ? format(formData.dueDate, "PPP") : "Select due date"}
//                     </Button>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0">
//                     <Calendar
//                       mode="single"
//                       selected={formData.dueDate}
//                       onSelect={(date) => {
//                         setFormData(prev => ({ ...prev, dueDate: date }))
//                         setDueDatePickerOpen(false)
//                       }}
//                       disabled={(date) =>
//                         date < new Date(new Date().setHours(0, 0, 0, 0))
//                       }
//                       initialFocus
//                     />
//                     {formData.dueDate && (
//                       <div className="p-3 border-t">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-full"
//                           onClick={() => {
//                             setFormData(prev => ({ ...prev, dueDate: undefined }))
//                             setDueDatePickerOpen(false)
//                           }}
//                         >
//                           Clear Date
//                         </Button>
//                       </div>
//                     )}
//                   </PopoverContent>
//                 </Popover>
//               </div>
//             </div>

//             {/* Comments */}
//             <div className="space-y-2">
//               <Label htmlFor="comments" className="text-sm font-medium text-blue-700">Comments</Label>
//               <Textarea
//                 id="comments"
//                 placeholder="Enter comments or additional details..."
//                 value={formData.comments}
//                 onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
//                 rows={4}
//                 disabled={isLoading}
//                 className="bg-blue-50/50"
//               />
//             </div>

//             {/* Tags */}
//             <div className="space-y-2">
//               <Label className="text-sm font-medium text-blue-700">Tags (Optional)</Label>
//               <div className="flex gap-2">
//                 <Input
//                   placeholder="Add tag..."
//                   value={tagInput}
//                   onChange={(e) => setTagInput(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   disabled={isLoading}
//                   className="bg-blue-50/50"
//                 />
//                 <Button
//                   type="button"
//                   variant="outline"
//                   size="icon"
//                   onClick={handleAddTag}
//                   disabled={!tagInput.trim() || isLoading}
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
              
//               {formData.tags.length > 0 && (
//                 <div className="flex flex-wrap gap-2 pt-2">
//                   {formData.tags.map((tag) => (
//                     <Badge key={tag} variant="secondary" className="gap-1">
//                       {tag}
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="icon"
//                         className="h-3 w-3 p-0 hover:bg-transparent"
//                         onClick={() => handleRemoveTag(tag)}
//                         disabled={isLoading}
//                       >
//                         <X className="h-2 w-2" />
//                       </Button>
//                     </Badge>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Helper text for empty dropdowns */}
//             {(!lookups?.modules?.length || !lookups?.departments?.length || !lookups?.taskTypes?.length) && (
//               <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                 <div className="flex items-center gap-2 text-amber-800 text-sm">
//                   <AlertTriangle className="h-4 w-4" />
//                   <span className="font-medium">Some dropdown options are empty</span>
//                 </div>
//                 <p className="text-amber-700 text-sm mt-1">
//                   Go to sidebar → "Form Data" to add options for the dropdown menus.
//                 </p>
//               </div>
//             )}

//             <DialogFooter className="gap-2 pt-6">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleClose}
//                 disabled={isLoading}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 type="submit" 
//                 disabled={!formData.name.trim() || isLoading}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     {mode === 'edit' ? 'Updating...' : 'Creating...'}
//                   </>
//                 ) : (
//                   <>
//                     {mode === 'edit' ? 'Update Task' : 'Submit'}
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         )}
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
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
  Hash,
  Check,
  ChevronsUpDown,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  task?: Task // For editing existing task
  mode?: 'create' | 'edit'
}

// Searchable Select Component
interface SearchableSelectProps {
  options: Array<{ id: string; name: string }>
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  emptyMessage: string
  disabled?: boolean
  className?: string
}

function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  emptyMessage,
  disabled = false,
  className = ""
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const selectedOption = options.find(option => option.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.id}
                value={option.name}
                onSelect={() => {
                  onValueChange(option.id === value ? "" : option.id)
                  setOpen(false)
                  setSearchValue("")
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
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
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-6">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
                  TaskFlow
                </span>
                <Badge variant="outline" className="text-xs font-medium">
                  Task Management
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'edit' 
                  ? 'Update the task details in the form below.'
                  : 'Fill out the form below to create a new task in the system.'
                }
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {lookupsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-muted-foreground">Loading form data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Task Name */}
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Task Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter a descriptive task name..."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      disabled={isLoading}
                      className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400 h-11"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-700 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </Label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-blue-200 focus:border-blue-400 h-11",
                            !formData.date && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                </div>
              </div>

              {/* Project Details Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Project Details
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Module */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Module
                    </Label>
                    <SearchableSelect
                      options={lookups?.modules || []}
                      value={formData.moduleId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}
                      placeholder="Select module"
                      emptyMessage="No modules found"
                      disabled={isLoading || !lookups?.modules?.length}
                      className="bg-white/80 border-green-200 focus:border-green-400 h-11"
                    />
                    {!lookups?.modules?.length && (
                      <p className="text-xs text-muted-foreground">No modules available</p>
                    )}
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Dev/Dept
                    </Label>
                    <SearchableSelect
                      options={lookups?.departments || []}
                      value={formData.devDeptId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, devDeptId: value }))}
                      placeholder="Select department"
                      emptyMessage="No departments found"
                      disabled={isLoading || !lookups?.departments?.length}
                      className="bg-white/80 border-green-200 focus:border-green-400 h-11"
                    />
                    {!lookups?.departments?.length && (
                      <p className="text-xs text-muted-foreground">No departments available</p>
                    )}
                  </div>

                  {/* Tracking No */}
                  <div className="space-y-2">
                    <Label htmlFor="trackingNo" className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Tracking No
                    </Label>
                    <Input
                      id="trackingNo"
                      placeholder="Enter tracking number..."
                      value={formData.trackingNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackingNo: e.target.value }))}
                      disabled={isLoading}
                      className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400 h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Task Classification Section */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Task Classification
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Task Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-purple-700 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Task Type
                    </Label>
                    <SearchableSelect
                      options={lookups?.taskTypes || []}
                      value={formData.taskTypeId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, taskTypeId: value, subTaskId: '' }))}
                      placeholder="Select task type"
                      emptyMessage="No task types found"
                      disabled={isLoading || !lookups?.taskTypes?.length}
                      className="bg-white/80 border-purple-200 focus:border-purple-400 h-11"
                    />
                    {!lookups?.taskTypes?.length && (
                      <p className="text-xs text-muted-foreground">No task types available</p>
                    )}
                  </div>

                  {/* Sub Task */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-purple-700 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Sub Task
                    </Label>
                    <SearchableSelect
                      options={filteredSubTasks}
                      value={formData.subTaskId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subTaskId: value }))}
                      placeholder={
                        !formData.taskTypeId 
                          ? "Select task type first" 
                          : filteredSubTasks.length 
                            ? "Select sub task" 
                            : "No sub tasks available"
                      }
                      emptyMessage="No sub tasks found"
                      disabled={isLoading || !filteredSubTasks.length}
                      className="bg-white/80 border-purple-200 focus:border-purple-400 h-11"
                    />
                    {!formData.taskTypeId && (
                      <p className="text-xs text-muted-foreground">Select task type first</p>
                    )}
                    {formData.taskTypeId && !filteredSubTasks.length && (
                      <p className="text-xs text-muted-foreground">No sub tasks for selected type</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Modify */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700 flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Modify
                    </Label>
                    <SearchableSelect
                      options={lookups?.modifyOptions || []}
                      value={formData.modifyId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, modifyId: value }))}
                      placeholder="Select modification"
                      emptyMessage="No modify options found"
                      disabled={isLoading || !lookups?.modifyOptions?.length}
                      className="bg-white/80 border-orange-200 focus:border-orange-400 h-11"
                    />
                    {!lookups?.modifyOptions?.length && (
                      <p className="text-xs text-muted-foreground">No modify options available</p>
                    )}
                  </div>

                  {/* Reference */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Reference
                    </Label>
                    <SearchableSelect
                      options={lookups?.references || []}
                      value={formData.referenceId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, referenceId: value }))}
                      placeholder="Select reference"
                      emptyMessage="No references found"
                      disabled={isLoading || !lookups?.references?.length}
                      className="bg-white/80 border-orange-200 focus:border-orange-400 h-11"
                    />
                    {!lookups?.references?.length && (
                      <p className="text-xs text-muted-foreground">No references available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Dates Section */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status & Timeline
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        status: value as CreateTaskData['status'] 
                      }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-slate-200 focus:border-slate-400 h-11">
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

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        priority: value as CreateTaskData['priority'] 
                      }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-slate-200 focus:border-slate-400 h-11">
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
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Due Date
                    </Label>
                    <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-slate-200 focus:border-slate-400 h-11",
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

                  {/* Solve Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Solve Date
                    </Label>
                    <Popover open={solveDatePickerOpen} onOpenChange={setSolveDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-slate-200 focus:border-slate-400 h-11",
                            !formData.solveDate && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.solveDate ? format(formData.solveDate, "PPP") : "Select solve date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                </div>
              </div>

              {/* Communication Section */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
                <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Communication
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sent By */}
                  <div className="space-y-2">
                    <Label htmlFor="sentBy" className="text-sm font-medium text-teal-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Sent By
                    </Label>
                    <Input
                      id="sentBy"
                      placeholder="Enter sender name..."
                      value={formData.sentBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, sentBy: e.target.value }))}
                      disabled={isLoading}
                      className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring-teal-400 h-11"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-teal-700 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Tags (Optional)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="bg-white/80 border-teal-200 focus:border-teal-400 focus:ring-teal-400 h-11"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || isLoading}
                        className="h-11 w-11 border-teal-200 hover:border-teal-400"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1 bg-teal-100 text-teal-800 border-teal-200">
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
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                <h3 className="text-lg font-semibold text-rose-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Comments & Notes
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="comments" className="text-sm font-medium text-rose-700 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Comments
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Enter comments, additional details, or special instructions..."
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    rows={4}
                    disabled={isLoading}
                    className="bg-white/80 border-rose-200 focus:border-rose-400 focus:ring-rose-400 resize-none"
                  />
                </div>
              </div>

              {/* Helper text for empty dropdowns */}
              {(!lookups?.modules?.length || !lookups?.departments?.length || !lookups?.taskTypes?.length) && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-amber-800 font-medium mb-2">Some dropdown options are empty</h4>
                      <p className="text-amber-700 text-sm leading-relaxed">
                        Some dropdown menus don't have options available yet. Go to the sidebar → "Form Data" to add options for the dropdown menus and improve your task creation experience.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-3 pt-6 border-t bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 h-11"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!formData.name.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 h-11 shadow-lg"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {mode === 'edit' ? 'Update Task' : 'Create Task'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}