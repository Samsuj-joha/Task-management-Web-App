// src/components/tasks/task-card.tsx
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
  Hash,
  Building2,
  FileText,
  Target,
  Settings
} from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
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

export function TaskCard({ task, onEdit }: TaskCardProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 relative h-80 w-full flex flex-col overflow-hidden">
      {/* Priority indicator bar */}
      <div 
        className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${
          task.priority === 'URGENT' ? 'bg-red-500' :
          task.priority === 'HIGH' ? 'bg-orange-500' :
          task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
        }`} 
      />

      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              <StatusIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <Badge className={`text-xs px-1.5 py-0.5 ${statusColors[task.status]}`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${priorityColors[task.priority]}`}>
                {task.priority}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5 animate-pulse">
                  <AlertTriangle className="h-2 w-2 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">
              {task.name || task.title}
            </h3>
            
            {/* Compact Task Details */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.module && (
                <span className="truncate">Module: {task.module}</span>
              )}
              {task.taskType && task.module && <span>•</span>}
              {task.taskType && (
                <span className="truncate">Type: {task.taskType}</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
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

      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="h-full overflow-y-auto space-y-2 pr-1" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}>
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
                <span className={`truncate ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Essential Information */}
          {task.subTask && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">Sub Task:</span>
              <p className="text-foreground mt-0.5 line-clamp-2">{task.subTask}</p>
            </div>
          )}

          {task.trackingNo && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">Tracking:</span>
              <p className="text-foreground mt-0.5 font-mono truncate">{task.trackingNo}</p>
            </div>
          )}

          {task.reference && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">Reference:</span>
              <p className="text-foreground mt-0.5 line-clamp-2">{task.reference}</p>
            </div>
          )}

          {task.sentBy && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">Sent By:</span>
              <p className="text-foreground mt-0.5 truncate">{task.sentBy}</p>
            </div>
          )}

          {/* Comments */}
          {(task.comments || task.description) && (
            <div className="text-xs">
              <span className="font-medium text-muted-foreground">Comments:</span>
              <p className="text-foreground mt-0.5 line-clamp-3">{task.comments || task.description}</p>
            </div>
          )}

          {/* Solve Date */}
          {task.solveDate && (
            <div className="flex items-center text-xs">
              <Target className="h-3 w-3 mr-1 text-green-600 flex-shrink-0" />
              <span className="text-green-600 font-medium truncate">
                Solved: {format(new Date(task.solveDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {/* Project */}
          {task.project && (
            <div className="flex items-center text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mr-1 flex-shrink-0" />
              <span className="text-muted-foreground truncate">
                Project: {task.project.name}
              </span>
            </div>
          )}

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs min-w-0">
                <User className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Assigned:</span>
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <Avatar className="h-4 w-4 flex-shrink-0">
                  <AvatarImage src={""} alt={task.assignee.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate">{task.assignee.name}</span>
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

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((taskTag) => (
                <Badge 
                  key={taskTag.tag.id} 
                  variant="secondary" 
                  className="text-xs px-1 py-0"
                  style={{ backgroundColor: `${taskTag.tag.color}20` }}
                >
                  {taskTag.tag.name}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{task.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer - Fixed at bottom */}
      <div className="flex items-center justify-between text-xs text-muted-foreground p-3 pt-2 border-t bg-card flex-shrink-0">
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