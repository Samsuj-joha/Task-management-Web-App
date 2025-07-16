// src/components/tasks/task-form.tsx - COMPLETE VERSION
'use client'

import { useState, useEffect } from 'react'
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
  Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  task?: Task // For editing existing task
  mode?: 'create' | 'edit'
}

export function TaskForm({ isOpen, onClose, task, mode = 'create' }: TaskFormProps) {
  // Fetch lookup data
  const { data: lookups, isLoading: lookupsLoading } = useLookups()

  // Form state - Initialize with task data if editing
  const [formData, setFormData] = useState<{
    title: string
    name: string
    description: string
    date: Date
    moduleId: string
    devDeptId: string
    taskTypeId: string
    subTaskId: string
    modifyId: string
    referenceId: string
    trackingNo: string
    status: CreateTaskData['status']
    solveDate?: Date
    sentBy: string
    comments: string
    priority: CreateTaskData['priority']
    dueDate?: Date
    tags: string[]
  }>({
    title: '',
    name: '',
    description: '',
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
  
  const [tagInput, setTagInput] = useState('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [solveDatePickerOpen, setSolveDatePickerOpen] = useState(false)
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

  // Pre-fill form data when task changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && task) {
      console.log('Pre-filling form with task data:', task)
      
      setFormData({
        title: task.title || '',
        name: task.name || task.title || '',
        description: task.description || task.comments || '',
        date: task.date ? new Date(task.date) : new Date(),
        moduleId: task.moduleId || '',
        devDeptId: task.devDeptId || '',
        taskTypeId: task.taskTypeId || '',
        subTaskId: task.subTaskId || '',
        modifyId: task.modifyId || '',
        referenceId: task.referenceId || '',
        trackingNo: task.trackingNo || '',
        status: (task.status || 'TODO') as CreateTaskData['status'],
        solveDate: task.solveDate ? new Date(task.solveDate) : undefined,
        sentBy: task.sentBy || '',
        comments: task.comments || task.description || '',
        priority: (task.priority || 'MEDIUM') as CreateTaskData['priority'],
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        tags: [] // Tags would need to be added to Task type if supported
      })
    } else if (mode === 'create') {
      // Reset form for create mode
      resetForm()
    }
  }, [task, mode, isOpen])

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
    
    if (!formData.name.trim() && !formData.title.trim()) {
      return // Name or title is required
    }

    try {
      const taskData: CreateTaskData = {
        title: formData.title.trim() || formData.name.trim(),
        name: formData.name.trim() || formData.title.trim(),
        description: formData.description.trim() || formData.comments.trim() || undefined,
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
        comments: formData.comments.trim() || formData.description.trim() || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate?.toISOString(),
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      }

      console.log('Submitting task data:', taskData)

      if (mode === 'edit' && task) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          data: taskData
        })
      } else {
        await createTaskMutation.mutateAsync(taskData)
      }

      onClose()
      if (mode === 'create') {
        resetForm()
      }
    } catch (error) {
      console.error('Task submission error:', error)
      // Error is handled by the mutation hooks
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      name: '',
      description: '',
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
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold">
                  {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {mode === 'edit' ? 'Update Mode' : 'Create Mode'}
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
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Task Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter task title..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        title: e.target.value,
                        name: e.target.value // Keep both in sync
                      }))}
                      disabled={isLoading}
                      className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNo" className="text-sm font-medium text-blue-700 flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Tracking Number
                    </Label>
                    <Input
                      id="trackingNo"
                      placeholder="Enter tracking number..."
                      value={formData.trackingNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackingNo: e.target.value }))}
                      disabled={isLoading}
                      className="bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Task Classification */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Task Classification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="module" className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Module
                    </Label>
                    <Select
                      value={formData.moduleId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400">
                        <SelectValue placeholder="Select module" />
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
                  <div className="space-y-2">
                    <Label htmlFor="taskType" className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Task Type
                    </Label>
                    <Select
                      value={formData.taskTypeId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, taskTypeId: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400">
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {lookups?.taskTypes?.map((taskType) => (
                          <SelectItem key={taskType.id} value={taskType.id}>
                            {taskType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subTask" className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Sub Task
                    </Label>
                    <Select
                      value={formData.subTaskId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subTaskId: value }))}
                      disabled={isLoading || !formData.taskTypeId}
                    >
                      <SelectTrigger className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400">
                        <SelectValue placeholder="Select sub task" />
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
              </div>

              {/* Department and Assignment */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Department & Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="devDept" className="text-sm font-medium text-purple-700 flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      Development Department
                    </Label>
                    <Select
                      value={formData.devDeptId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, devDeptId: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                        <SelectValue placeholder="Select department" />
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
                  <div className="space-y-2">
                    <Label htmlFor="sentBy" className="text-sm font-medium text-purple-700 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Sent By
                    </Label>
                    <Input
                      id="sentBy"
                      placeholder="Enter who sent this task..."
                      value={formData.sentBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, sentBy: e.target.value }))}
                      disabled={isLoading}
                      className="bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Status & Priority
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium text-orange-700 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CreateTaskData['status'] }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="IN_REVIEW">In Review</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium text-orange-700 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as CreateTaskData['priority'] }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
                <h3 className="text-lg font-semibold text-cyan-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Important Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-cyan-700 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Task Date
                    </Label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400",
                            !formData.date && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "PPP") : "Pick a date"}
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-cyan-700 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Due Date
                    </Label>
                    <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400",
                            !formData.dueDate && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick due date"}
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-cyan-700 flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Solve Date
                    </Label>
                    <Popover open={solveDatePickerOpen} onOpenChange={setSolveDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400",
                            !formData.solveDate && "text-muted-foreground"
                          )}
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.solveDate ? format(formData.solveDate, "PPP") : "Pick solve date"}
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
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Additional Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modifyOption" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      Modify Option
                    </Label>
                    <Select
                      value={formData.modifyId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, modifyId: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                        <SelectValue placeholder="Select modify option" />
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
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Reference
                    </Label>
                    <Select
                      value={formData.referenceId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, referenceId: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-white/80 border-gray-200 focus:border-gray-400 focus:ring-gray-400">
                        <SelectValue placeholder="Select reference" />
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
                </div>
              </div>

              {/* Description/Comments */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                <h3 className="text-lg font-semibold text-rose-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Description & Comments
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
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      comments: e.target.value,
                      description: e.target.value // Keep both in sync
                    }))}
                    rows={4}
                    disabled={isLoading}
                    className="bg-white/80 border-rose-200 focus:border-rose-400 focus:ring-rose-400 resize-none"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tags
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="bg-white/80 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || isLoading}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
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
            disabled={(!formData.name.trim() && !formData.title.trim()) || isLoading}
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