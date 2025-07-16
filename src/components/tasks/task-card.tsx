



// src/components/tasks/task-card.tsx - COMPLETE FIXED VERSION
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUpdateTask, useDeleteTask, type Task } from '@/hooks/use-tasks'
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Target,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Building2,
  Hash,
  FileText,
  Users,
  Settings,
  Link
} from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  isExpanded?: boolean
  onExpandChange?: (taskId: string, expanded: boolean) => void
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200',
}

const statusIcons = {
  TODO: Clock,
  IN_PROGRESS: PlayCircle,
  IN_REVIEW: PauseCircle,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
}

export function TaskCard({ task, onEdit, isExpanded = false, onExpandChange }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const StatusIcon = statusIcons[task.status]
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED'

  const handleStatusChange = async (newStatus: Task['status']) => {
    console.log(`🔄 Changing status from ${task.status} to ${newStatus} for task ${task.id}`)
    setIsUpdating(true)
    
    try {
      const result = await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: newStatus }
      })
      console.log('✅ Status update successful:', result)
    } catch (error) {
      console.error('❌ Status update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTaskMutation.mutateAsync(task.id)
    }
  }

  const handleExpand = () => {
    onExpandChange?.(task.id, !isExpanded)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Check if task has expandable content - FIXED to use proper property access
  const hasExpandableContent = Boolean(
    (task.subTask && task.subTask.name) || 
    task.trackingNo || 
    (task.reference && task.reference.name) || 
    task.sentBy || 
    task.solveDate || 
    (task.modify && task.modify.name) ||
    (task.tags && task.tags.length > 0) ||
    (task.comments && task.comments.length > 100) ||
    (task.description && task.description.length > 100)
  )

  return (
    <Card 
      className={cn(
        "group relative transition-all duration-300 ease-in-out hover:shadow-lg overflow-hidden",
        "border-l-4",
        isExpanded ? "ring-2 ring-primary/20 shadow-xl scale-[1.02] z-10" : "hover:shadow-md",
        task.priority === 'URGENT' ? 'border-l-red-500' :
        task.priority === 'HIGH' ? 'border-l-orange-500' :
        task.priority === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-green-500'
      )}
      style={{
        height: isExpanded ? 'auto' : '320px',
        width: '100%',
        minHeight: '320px',
        maxHeight: isExpanded ? '600px' : '320px'
      }}
    >
      {/* Fixed Header Section */}
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              <StatusIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <Badge className={cn("text-xs px-1.5 py-0.5", statusColors[task.status])}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 animate-pulse">
                  <AlertTriangle className="h-2 w-2 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {task.name || task.title}
            </h3>
            
            {/* FIXED: Proper display of task details from database relations */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {task.module && task.module.name && (
                <span className="truncate bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <Building2 className="h-2 w-2" />
                  {task.module.name}
                </span>
              )}
              {task.taskType && task.taskType.name && (
                <span className="truncate bg-purple-50 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <FileText className="h-2 w-2" />
                  {task.taskType.name}
                </span>
              )}
              {task.devDept && task.devDept.name && (
                <span className="truncate bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <Users className="h-2 w-2" />
                  {task.devDept.name}
                </span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleStatusChange('TODO')}
                disabled={isUpdating}
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark as Todo
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={isUpdating}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Progress
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdating}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600"
                disabled={deleteTaskMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Content Section with Fixed Height */}
      <CardContent className="pt-0 pb-4 flex flex-col" style={{ height: isExpanded ? 'auto' : '200px' }}>
        {/* Always Visible Content */}
        <div className="space-y-2 flex-shrink-0">
          {/* Date Information */}
          <div className="grid grid-cols-1 gap-1 text-xs">
            {task.date && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">
                  Created: {format(new Date(task.date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                <span className={cn(
                  "truncate",
                  isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'
                )}>
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {/* FIXED: Display tracking number if available */}
            {task.trackingNo && (
              <div className="flex items-center">
                <Hash className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate font-mono text-xs">
                  {task.trackingNo}
                </span>
              </div>
            )}
          </div>

          {/* Project and Assignee Row */}
          <div className="flex items-center justify-between">
            {task.project && (
              <div className="flex items-center text-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1 flex-shrink-0" />
                <span className="text-muted-foreground truncate">
                  Project: {task.project.name}
                </span>
              </div>
            )}

            {task.assignee && (
              <div className="flex items-center gap-1 min-w-0">
                <Avatar className="h-4 w-4 flex-shrink-0">
                  <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-20">{task.assignee.name}</span>
              </div>
            )}
          </div>

          {/* Comments Preview (Always show first 2 lines) */}
          {(task.comments || task.description) && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">Comments:</span>
              <p className={cn(
                "text-foreground mt-0.5",
                isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
              )}>
                {task.comments || task.description}
              </p>
            </div>
          )}
        </div>

        {/* Expandable Content */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
          )}
        >
          {isExpanded && (
            <div className="space-y-2 pt-3 border-t">
              {/* Sub Task - FIXED */}
              {task.subTask && task.subTask.name && (
                <div className="text-xs">
                  <span className="font-medium text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Sub Task:
                  </span>
                  <p className="text-foreground mt-0.5 bg-purple-50 text-purple-800 px-2 py-1 rounded">
                    {task.subTask.name}
                  </p>
                </div>
              )}

              {/* Modify Option - FIXED */}
              {task.modify && task.modify.name && (
                <div className="text-xs">
                  <span className="font-medium text-muted-foreground flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Modify:
                  </span>
                  <p className="text-foreground mt-0.5 bg-orange-50 text-orange-800 px-2 py-1 rounded">
                    {task.modify.name}
                  </p>
                </div>
              )}

              {/* Reference - FIXED */}
              {task.reference && task.reference.name && (
                <div className="text-xs">
                  <span className="font-medium text-muted-foreground flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    Reference:
                  </span>
                  <p className="text-foreground mt-0.5 bg-teal-50 text-teal-800 px-2 py-1 rounded">
                    {task.reference.name}
                  </p>
                </div>
              )}

              {/* Sent By */}
              {task.sentBy && (
                <div className="text-xs">
                  <span className="font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Sent By:
                  </span>
                  <p className="text-foreground mt-0.5 bg-blue-50 text-blue-800 px-2 py-1 rounded">
                    {task.sentBy}
                  </p>
                </div>
              )}

              {/* Solve Date */}
              {task.solveDate && (
                <div className="flex items-center text-xs">
                  <Target className="h-3 w-3 mr-1 text-green-600 flex-shrink-0" />
                  <span className="text-green-600 font-medium">
                    Solved: {format(new Date(task.solveDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {/* Tags - FIXED */}
              {task.tags && task.tags.length > 0 && (
                <div className="space-y-1">
                  <span className="font-medium text-muted-foreground text-xs flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Tags:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map((taskTag) => (
                      <Badge 
                        key={taskTag.tag.id} 
                        variant="secondary" 
                        className="text-xs px-2 py-0.5"
                        style={{ backgroundColor: `${taskTag.tag.color}20` }}
                      >
                        {taskTag.tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments count */}
              {task._count?.comments && task._count.comments > 0 && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span>{task._count.comments} comment{task._count.comments !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spacer to push footer down */}
        <div className="flex-1"></div>

        {/* Expand/Collapse Button */}
        {hasExpandableContent && (
          <div className="pt-2 border-t mt-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpand}
              className="w-full h-8 text-xs hover:bg-primary/10 transition-colors"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-3 w-3 mr-2" />
                  Show Less
                  <ChevronUp className="h-3 w-3 ml-2" />
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-2" />
                  See More
                  <ChevronDown className="h-3 w-3 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Footer - Always Visible at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between text-xs text-muted-foreground p-3 pt-2 border-t bg-card/95 backdrop-blur-sm">
        <span className="truncate">
          {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
        </span>
        {task.completedAt && (
          <span className="text-green-600 truncate ml-2">
            ✅ {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
          </span>
        )}
      </div>
    </Card>
  )
}