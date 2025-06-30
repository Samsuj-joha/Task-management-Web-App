// src/components/tasks/task-filters.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type TaskFilters } from '@/hooks/use-tasks'
import { 
  Search, 
  Filter, 
  X, 
  Clock,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  Building2,
  FileText
} from 'lucide-react'

interface TaskFiltersProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  taskCounts?: {
    all: number
    todo: number
    inProgress: number
    inReview: number
    completed: number
    cancelled: number
  }
}

const statusOptions = [
  { value: 'all', label: 'All Status', icon: Filter },
  { value: 'TODO', label: 'Todo', icon: Clock },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: PlayCircle },
  { value: 'IN_REVIEW', label: 'In Review', icon: PauseCircle },
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle },
]

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'LOW', label: 'Low', color: 'bg-green-500' },
]

const moduleOptions = [
  { value: 'all', label: 'All Modules' },
  { value: 'Frontend Development', label: 'Frontend Development' },
  { value: 'Backend Development', label: 'Backend Development' },
  { value: 'Database Management', label: 'Database Management' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'DevOps & Deployment', label: 'DevOps & Deployment' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'API Development', label: 'API Development' },
  { value: 'System Integration', label: 'System Integration' },
  { value: 'Documentation', label: 'Documentation' },
]

const taskTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'Bug Fix', label: 'Bug Fix' },
  { value: 'Feature Development', label: 'Feature Development' },
  { value: 'Enhancement', label: 'Enhancement' },
  { value: 'Research', label: 'Research' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Code Review', label: 'Code Review' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Deployment', label: 'Deployment' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Support', label: 'Support' },
]

const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: 'Frontend Team', label: 'Frontend Team' },
  { value: 'Backend Team', label: 'Backend Team' },
  { value: 'Full Stack Team', label: 'Full Stack Team' },
  { value: 'Mobile Team', label: 'Mobile Team' },
  { value: 'DevOps Team', label: 'DevOps Team' },
  { value: 'QA Team', label: 'QA Team' },
  { value: 'UI/UX Team', label: 'UI/UX Team' },
  { value: 'Product Team', label: 'Product Team' },
  { value: 'Data Team', label: 'Data Team' },
  { value: 'Security Team', label: 'Security Team' },
]

export function TaskFilters({ filters, onFiltersChange, taskCounts }: TaskFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ 
      ...filters, 
      status: status === 'all' ? undefined : status 
    })
  }

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({ 
      ...filters, 
      priority: priority === 'all' ? undefined : priority 
    })
  }

  const handleModuleChange = (module: string) => {
    onFiltersChange({ 
      ...filters, 
      module: module === 'all' ? undefined : module 
    })
  }

  const handleTaskTypeChange = (taskType: string) => {
    onFiltersChange({ 
      ...filters, 
      taskType: taskType === 'all' ? undefined : taskType 
    })
  }

  const handleDevDeptChange = (devDept: string) => {
    onFiltersChange({ 
      ...filters, 
      devDept: devDept === 'all' ? undefined : devDept 
    })
  }

  const clearFilters = () => {
    setSearchValue('')
    onFiltersChange({})
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks by name, tracking number, or comments..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Primary Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Select 
            value={filters.status || 'all'} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[140px]">
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
                      {taskCounts && option.value !== 'all' && (
                        <Badge variant="secondary" className="ml-auto">
                          {taskCounts[option.value.toLowerCase() as keyof typeof taskCounts]}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Priority:</span>
          <Select 
            value={filters.priority || 'all'} 
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.color && (
                      <div className={`h-2 w-2 rounded-full ${option.color}`} />
                    )}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Module Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Module:</span>
          <Select 
            value={filters.module || 'all'} 
            onValueChange={handleModuleChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {moduleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* More Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Additional Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Task Type Filter */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Task Type
            </DropdownMenuLabel>
            <div className="px-2 py-1">
              <Select 
                value={filters.taskType || 'all'} 
                onValueChange={handleTaskTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Department Filter */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Department
            </DropdownMenuLabel>
            <div className="px-2 py-1">
              <Select 
                value={filters.devDept || 'all'} 
                onValueChange={handleDevDeptChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Quick Status Filters */}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Quick Status Toggle
            </DropdownMenuLabel>
            {statusOptions.slice(1).map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status === option.value}
                onCheckedChange={(checked) => 
                  handleStatusChange(checked ? option.value : 'all')
                }
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.replace('_', ' ')}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleStatusChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              Priority: {filters.priority}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handlePriorityChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.module && (
            <Badge variant="secondary" className="gap-1">
              Module: {filters.module}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleModuleChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.taskType && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.taskType}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleTaskTypeChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.devDept && (
            <Badge variant="secondary" className="gap-1">
              Dept: {filters.devDept}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDevDeptChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}