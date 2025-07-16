// src/components/tasks/task-table.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUpdateTask, useDeleteTask, type Task } from '@/hooks/use-tasks'
import { 
  Search, Filter, ChevronLeft, ChevronRight, 
  MoreHorizontal, Edit, Trash2, Eye, Calendar,
  User, Flag, Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface TaskTableProps {
  tasks: Task[]
  isLoading: boolean
  onEditTask?: (task: Task) => void
}

const statusColors = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

const statuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'CANCELLED']

export function TaskTable({ tasks, isLoading, onEditTask }: TaskTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      (task.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.comments?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTasks = filteredTasks.slice(startIndex, endIndex)

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: { status: newStatus as any }
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks by name, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {currentTasks.length} of {filteredTasks.length} tasks
          {searchTerm && ` matching "${searchTerm}"`}
        </span>
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => {
              setItemsPerPage(Number(value))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Task Name</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                            ? 'No tasks match your filters' 
                            : 'No tasks found'
                          }
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="font-medium truncate">
                            {task.title || task.name}
                          </div>
                          {(task.description || task.comments) && (
                            <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                              {task.description || task.comments}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <>
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{task.assignee.name}</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={cn("text-xs", priorityColors[task.priority])}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(task.date)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Select 
                          value={task.status} 
                          onValueChange={(value) => handleStatusChange(task.id, value)}
                          disabled={updateTaskMutation.isPending}
                        >
                          <SelectTrigger className="w-auto min-w-[130px]">
                            <Badge className={cn("text-xs border-none", statusColors[task.status])}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map(status => (
                              <SelectItem key={status} value={status}>
                                <Badge className={cn("text-xs", statusColors[status as keyof typeof statusColors])}>
                                  {status.replace('_', ' ')}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditTask?.(task)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditTask?.(task)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Task
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 focus:text-red-600"
                              disabled={deleteTaskMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {filteredTasks.length} total tasks
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}