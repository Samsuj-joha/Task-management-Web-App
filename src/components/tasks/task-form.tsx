// src/components/tasks/task-form.tsx
'use client'

import { useState } from 'react'
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

const moduleOptions = [
  'Frontend Development',
  'Backend Development', 
  'Database Management',
  'UI/UX Design',
  'Quality Assurance',
  'DevOps & Deployment',
  'Mobile Development',
  'API Development',
  'System Integration',
  'Documentation'
]

const taskTypeOptions = [
  'Bug Fix',
  'Feature Development',
  'Enhancement',
  'Research',
  'Testing',
  'Code Review',
  'Documentation',
  'Deployment',
  'Maintenance',
  'Support'
]

const departmentOptions = [
  'Frontend Team',
  'Backend Team',
  'Full Stack Team',
  'Mobile Team',
  'DevOps Team',
  'QA Team',
  'UI/UX Team',
  'Product Team',
  'Data Team',
  'Security Team'
]

export function TaskForm({ isOpen, onClose, task, mode = 'create' }: TaskFormProps) {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    date: task?.date ? new Date(task.date) : new Date(),
    module: task?.module || '',
    devDept: task?.devDept || '',
    taskType: task?.taskType || '',
    subTask: task?.subTask || '',
    modify: task?.modify || '',
    reference: task?.reference || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return // Name is required
    }

    try {
      const taskData: CreateTaskData = {
        name: formData.name.trim(),
        date: formData.date?.toISOString(),
        module: formData.module || undefined,
        devDept: formData.devDept || undefined,
        taskType: formData.taskType || undefined,
        subTask: formData.subTask.trim() || undefined,
        modify: formData.modify.trim() || undefined,
        reference: formData.reference.trim() || undefined,
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
      module: '',
      devDept: '',
      taskType: '',
      subTask: '',
      modify: '',
      reference: '',
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

            {/* Module */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-700">Module</Label>
              <Select
                value={formData.module}
                onValueChange={(value) => setFormData(prev => ({ ...prev, module: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-blue-50/50">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {moduleOptions.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dev/Dept */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-700">Dev/Dept</Label>
              <Select
                value={formData.devDept}
                onValueChange={(value) => setFormData(prev => ({ ...prev, devDept: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-blue-50/50">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-blue-700">Task Type</Label>
              <Select
                value={formData.taskType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, taskType: value }))}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-blue-50/50">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Task */}
            <div className="space-y-2">
              <Label htmlFor="subTask" className="text-sm font-medium text-blue-700">Sub Task</Label>
              <Input
                id="subTask"
                placeholder="Enter sub task..."
                value={formData.subTask}
                onChange={(e) => setFormData(prev => ({ ...prev, subTask: e.target.value }))}
                disabled={isLoading}
                className="bg-blue-50/50"
              />
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Modify */}
            <div className="space-y-2">
              <Label htmlFor="modify" className="text-sm font-medium text-blue-700">Modify</Label>
              <Input
                id="modify"
                placeholder="Enter modification details..."
                value={formData.modify}
                onChange={(e) => setFormData(prev => ({ ...prev, modify: e.target.value }))}
                disabled={isLoading}
                className="bg-blue-50/50"
              />
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-medium text-blue-700">Reference</Label>
              <Input
                id="reference"
                placeholder="Enter reference..."
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                disabled={isLoading}
                className="bg-blue-50/50"
              />
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
      </DialogContent>
    </Dialog>
  )
}