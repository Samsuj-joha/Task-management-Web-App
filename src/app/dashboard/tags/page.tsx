// src/app/dashboard/tags/page.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useTags, type Tag } from '@/hooks/use-tags'
import { toast } from 'sonner'
import { 
  Tag as TagIcon, Plus, Search, Filter, MoreHorizontal, 
  CheckCircle2, Clock, AlertCircle, Activity, Edit, Trash2,
  Target, TrendingUp, Hash
} from 'lucide-react'

// Predefined color options
const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
]

export default function TagsPage() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  })

  // API calls
  const { data, isLoading, error, refetch, createTag, updateTag, deleteTag } = useTags({
    search: searchQuery,
    sortBy,
    sortOrder
  })

  const tags = data?.tags || []

  // Form handlers
  const resetForm = () => {
    setFormData({ name: '', color: '#3B82F6' })
  }

  const handleCreateTag = async () => {
    if (!formData.name.trim()) {
      toast.error('Tag name is required')
      return
    }

    const success = await createTag(formData)
    if (success) {
      setIsCreateOpen(false)
      resetForm()
    }
  }

  const handleEditTag = async () => {
    if (!selectedTag || !formData.name.trim()) {
      toast.error('Tag name is required')
      return
    }

    const success = await updateTag(selectedTag.id, formData)
    if (success) {
      setIsEditOpen(false)
      setSelectedTag(null)
      resetForm()
    }
  }

  const handleDeleteTag = async (tag: Tag) => {
    if (tag.stats.totalTasks > 0) {
      toast.error(`Cannot delete "${tag.name}" because it's used by ${tag.stats.totalTasks} task(s)`)
      return
    }

    if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      await deleteTag(tag.id)
    }
  }

  const openEditDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color
    })
    setIsEditOpen(true)
  }

  // Calculate overall statistics
  const overallStats = {
    totalTags: tags.length,
    totalTasks: tags.reduce((sum, tag) => sum + tag.stats.totalTasks, 0),
    completedTasks: tags.reduce((sum, tag) => sum + tag.stats.completedTasks, 0),
    avgCompletionRate: tags.length > 0 
      ? Math.round(tags.reduce((sum, tag) => sum + tag.stats.completionRate, 0) / tags.length)
      : 0
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Tags</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags Management</h1>
          <p className="text-muted-foreground">
            Organize and manage task tags for better categorization
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>Add a new tag to organize your tasks</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter tag name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                  <Input
                    className="mt-2"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3B82F6"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTag}>
                    Create Tag
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{overallStats.totalTags}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Tag categories created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tagged Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{overallStats.totalTasks}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {overallStats.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{overallStats.avgCompletionRate}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              Across all tagged tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {tags.length > 0 ? Math.max(...tags.map(t => t.stats.totalTasks)) : 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Tasks in top tag
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="usage">Usage</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Asc</SelectItem>
            <SelectItem value="desc">Desc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tags.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tags found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first tag to organize tasks'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Tag Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{tag.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tag.stats.totalTasks} task{tag.stats.totalTasks !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTag(tag)}
                        className="text-red-600"
                        disabled={tag.stats.totalTasks > 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Tag Statistics */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">
                      {tag.stats.completedTasks}/{tag.stats.totalTasks}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{tag.stats.completionRate}%</span>
                    </div>
                    <Progress value={tag.stats.completionRate} className="h-2" />
                  </div>
                  
                  {tag.stats.urgentTasks > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{tag.stats.urgentTasks} urgent</span>
                    </div>
                  )}
                  
                  {tag.stats.inProgressTasks > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Clock className="h-3 w-3" />
                      <span>{tag.stats.inProgressTasks} in progress</span>
                    </div>
                  )}
                </div>

                {/* Recent Tasks Preview */}
                {tag.recentTasks && tag.recentTasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Tasks</h4>
                    <div className="space-y-1">
                      {tag.recentTasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="text-xs">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={task.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-xs h-4"
                            >
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {tag.recentTasks.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{tag.recentTasks.length - 2} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Tag Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>Update tag information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Tag Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-color">Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
              <Input
                className="mt-2"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="#3B82F6"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEditTag}>
                Update Tag
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}