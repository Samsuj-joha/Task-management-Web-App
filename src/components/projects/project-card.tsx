// src/components/projects/project-card.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUpdateProject, useDeleteProject, type Project } from '@/hooks/use-projects'
import { 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Users, 
  Calendar,
  Target,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  Pause,
  Archive,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  viewMode?: 'grid' | 'list'
  onEdit?: (project: Project) => void
}

const statusColors = {
  ACTIVE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ON_HOLD: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  URGENT: 'bg-red-100 text-red-800 border-red-200',
}

const statusIcons = {
  ACTIVE: Play,
  COMPLETED: CheckCircle2,
  ON_HOLD: Pause,
  ARCHIVED: Archive,
}

export function ProjectCard({ project, viewMode = 'grid', onEdit }: ProjectCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()

  const StatusIcon = statusIcons[project.status]
  const isOverdue = project.deadline && isPast(new Date(project.deadline)) && project.status !== 'COMPLETED'
  
  // Calculate progress
  const totalTasks = project._count?.tasks || 0
  const completedTasks = project.tasks?.filter(task => task.status === 'COMPLETED').length || 0
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Get team members display
  const maxDisplayMembers = 3
  const displayMembers = project.members?.slice(0, maxDisplayMembers) || []
  const remainingMembers = Math.max(0, (project._count?.members || 0) - maxDisplayMembers)

  const handleStatusChange = async (newStatus: Project['status']) => {
    setIsUpdating(true)
    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: { status: newStatus }
      })
    } catch (error) {
      console.error('Failed to update project status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      await deleteProjectMutation.mutateAsync(project.id)
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

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Project color indicator */}
              {project.color && (
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link 
                    href={`/dashboard/projects/${project.id}`}
                    className="font-semibold text-lg hover:underline truncate"
                  >
                    {project.name}
                  </Link>
                  <StatusIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Badge className={cn('text-xs', statusColors[project.status])}>
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs', priorityColors[project.priority])}>
                    {project.priority}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
                
                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    <span>{progressPercentage}% complete</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{completedTasks}/{totalTasks} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{project._count?.members || 0} members</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className={isOverdue ? 'text-red-600' : ''}>
                        Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="w-24">
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Team members */}
              <div className="flex items-center gap-1">
                {displayMembers.map((member) => (
                  <Avatar key={member.id} className="h-6 w-6">
                    <AvatarImage src={member.user.image} alt={member.user.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingMembers > 0 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    +{remainingMembers}
                  </div>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Project
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(project)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={isUpdating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Mark Active
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleStatusChange('ON_HOLD')}
                    disabled={isUpdating}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Put On Hold
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
                    disabled={deleteProjectMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 relative h-80 flex flex-col overflow-hidden">
      {/* Priority indicator */}
      <div 
        className={`absolute top-0 left-0 w-1 h-full ${
          project.priority === 'URGENT' ? 'bg-red-500' :
          project.priority === 'HIGH' ? 'bg-orange-500' :
          project.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
        }`} 
      />

      {/* Project color header */}
      {project.color && (
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: project.color }}
        />
      )}

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusIcon className="h-4 w-4 text-muted-foreground" />
              <Badge className={cn('text-xs', statusColors[project.status])}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', priorityColors[project.priority])}>
                {project.priority}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            
            <Link 
              href={`/dashboard/projects/${project.id}`}
              className="font-semibold text-lg leading-tight hover:underline line-clamp-2 block"
            >
              {project.name}
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/projects/${project.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleStatusChange('ACTIVE')}
                disabled={isUpdating}
              >
                <Play className="h-4 w-4 mr-2" />
                Mark Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange('ON_HOLD')}
                disabled={isUpdating}
              >
                <Pause className="h-4 w-4 mr-2" />
                Put On Hold
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
                disabled={deleteProjectMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="h-full overflow-y-auto space-y-3 pr-1">
          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total tasks</span>
            </div>
          </div>

          {/* Key info */}
          <div className="space-y-2 text-sm">
            {project.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={cn('text-muted-foreground', isOverdue && 'text-red-600 font-medium')}>
                  Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                </span>
              </div>
            )}

            {project.budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  ${project.budget.toLocaleString()} budget
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {project._count?.members || 0} team members
              </span>
            </div>
          </div>

          {/* Team members */}
          {displayMembers.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">Team</span>
              <div className="flex items-center gap-1 flex-wrap">
                {displayMembers.map((member) => (
                  <Avatar key={member.id} className="h-6 w-6">
                    <AvatarImage src={member.user.image} alt={member.user.name} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingMembers > 0 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    +{remainingMembers}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer */}
      <div className="px-6 py-3 border-t bg-card flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </span>
          <span>
            Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Card>
  )
}