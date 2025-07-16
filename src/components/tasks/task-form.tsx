// src/components/tasks/task-form.tsx - SIMPLIFIED & CENTERED VERSION
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useCreateTask, useUpdateTask, type CreateTaskData, type Task } from '@/hooks/use-tasks'
import { useLookups } from '@/hooks/use-lookups'
import { format } from 'date-fns'
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  FileText,
  Clock,
  Flag,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  task?: Task
  mode?: 'create' | 'edit'
}

const priorityOptions = [
  { value: 'LOW', label: 'Low', color: 'text-green-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
  { value: 'HIGH', label: 'High', color: 'text-orange-600' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-600' },
]

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function TaskForm({ isOpen, onClose, task, mode = 'create' }: TaskFormProps) {
  const { data: lookups, isLoading: lookupsLoading } = useLookups()
  
  const [formData, setFormData] = useState({
    title: task?.title || task?.name || '',
    name: task?.name || task?.title || '',
    description: task?.description || task?.comments || '',
    date: task?.date ? new Date(task.date) : new Date(),
    moduleId: task?.moduleId || 'none',
    devDeptId: task?.devDeptId || 'none',
    taskTypeId: task?.taskTypeId || 'none',
    trackingNo: task?.trackingNo || '',
    status: (task?.status || 'TODO') as CreateTaskData['status'],
    priority: (task?.priority || 'MEDIUM') as CreateTaskData['priority'],
    dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
    comments: task?.comments || task?.description || '',
  })
  
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

  const handleSubmit = async () => {
    if (!formData.title.trim() && !formData.name.trim()) {
      toast.error('Task name is required')
      return
    }

    try {
      const taskData: CreateTaskData = {
        title: formData.title.trim() || formData.name.trim(),
        name: formData.name.trim() || formData.title.trim(),
        description: formData.description.trim() || formData.comments.trim() || undefined,
        date: formData.date?.toISOString(),
        moduleId: formData.moduleId === 'none' ? undefined : formData.moduleId || undefined,
        devDeptId: formData.devDeptId === 'none' ? undefined : formData.devDeptId || undefined,
        taskTypeId: formData.taskTypeId === 'none' ? undefined : formData.taskTypeId || undefined,
        trackingNo: formData.trackingNo.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate?.toISOString(),
        comments: formData.comments.trim() || undefined,
      }

      if (mode === 'edit' && task) {
        await updateTaskMutation.mutateAsync({
          id: task.id,
          data: taskData
        })
        toast.success('Task updated successfully!')
      } else {
        await createTaskMutation.mutateAsync(taskData)
        toast.success('Task created successfully!')
      }

      onClose()
      resetForm()
    } catch (error) {
      console.error('Task submission error:', error)
      toast.error('Failed to save task')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      name: '',
      description: '',
      date: new Date(),
      moduleId: 'none',
      devDeptId: 'none',
      taskTypeId: 'none',
      trackingNo: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: undefined,
      comments: '',
    })
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-blue-600" />
            {mode === 'edit' ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        {lookupsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Task Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Task Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter task name..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value,
                  title: e.target.value
                }))}
                disabled={isLoading}
                className="h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter task description..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value,
                  comments: e.target.value
                }))}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {priorityOptions.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Status
                </Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date</Label>
                <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
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
                        setDueDatePickerOpen(false)
                      }}
                      disabled={(date) =>
                        formData.date ? date < formData.date : false
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

            {/* Module and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Module</Label>
                <Select 
                  value={formData.moduleId} 
                  onValueChange={(value) => setFormData(prev => ({...prev, moduleId: value}))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No module</SelectItem>
                    {lookups?.modules?.map(module => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Department</Label>
                <Select 
                  value={formData.devDeptId} 
                  onValueChange={(value) => setFormData(prev => ({...prev, devDeptId: value}))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No department</SelectItem>
                    {lookups?.departments?.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Task Type and Tracking No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Task Type</Label>
                <Select 
                  value={formData.taskTypeId} 
                  onValueChange={(value) => setFormData(prev => ({...prev, taskTypeId: value}))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task type</SelectItem>
                    {lookups?.taskTypes?.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNo" className="text-sm font-medium">
                  Tracking Number
                </Label>
                <Input
                  id="trackingNo"
                  placeholder="Enter tracking number..."
                  value={formData.trackingNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackingNo: e.target.value }))}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-sm font-medium">
                Additional Comments
              </Label>
              <Textarea
                id="comments"
                placeholder="Enter additional comments or notes..."
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  comments: e.target.value
                }))}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter className="pt-6 border-t">
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
            disabled={(!formData.name.trim() && !formData.title.trim()) || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              mode === 'edit' ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}