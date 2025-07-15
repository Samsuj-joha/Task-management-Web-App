// src/components/notes/note-card.tsx
'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Note } from '@/hooks/use-notes'
import {
  MoreVertical,
  Pin,
  Edit,
  Archive,
  Trash2,
  PinIcon,
  Clock,
  Tag,
  AlertTriangle
} from 'lucide-react'

interface NoteCardProps {
  note: Note
  viewMode: 'grid' | 'list'
  onEdit: (id: string) => void
  onPin: (id: string, isPinned: boolean) => void
  onArchive: (id: string, isArchived: boolean) => void
  onDelete: (id: string) => void
}

export function NoteCard({ 
  note, 
  viewMode, 
  onEdit, 
  onPin, 
  onArchive, 
  onDelete 
}: NoteCardProps) {
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getPriorityColor = (priority: Note['priority']) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: Note['priority']) => {
    switch (priority) {
      case 'URGENT': return <AlertTriangle className="h-3 w-3" />
      case 'HIGH': return <AlertTriangle className="h-3 w-3" />
      default: return null
    }
  }

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Card 
      className={cn(
        'group hover:shadow-md transition-all duration-200 cursor-pointer relative',
        note.isPinned && 'ring-2 ring-amber-200 bg-amber-50/30',
        note.isArchived && 'opacity-60',
        viewMode === 'list' && 'hover:bg-muted/50'
      )}
      onClick={() => onEdit(note.id)}
    >
      {/* Pin Indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2 z-10">
          <PinIcon className="h-4 w-4 text-amber-600 transform rotate-45" />
        </div>
      )}

      <CardHeader className={cn(
        'pb-3',
        viewMode === 'list' && 'py-3'
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold truncate',
              viewMode === 'grid' ? 'text-base' : 'text-lg',
              note.isArchived && 'text-muted-foreground'
            )}>
              {note.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              {/* Category */}
              {note.category && (
                <div className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: note.category.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {note.category.name}
                  </span>
                </div>
              )}

              {/* Priority */}
              {note.priority !== 'MEDIUM' && (
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', getPriorityColor(note.priority))}
                >
                  {getPriorityIcon(note.priority)}
                  <span className="ml-1">{note.priority}</span>
                </Badge>
              )}

              {/* Date */}
              <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-auto">
                <Clock className="h-3 w-3" />
                <span>{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onEdit(note.id)
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onPin(note.id, note.isPinned)
              }}>
                <Pin className="h-4 w-4 mr-2" />
                {note.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onArchive(note.id, note.isArchived)
              }}>
                <Archive className="h-4 w-4 mr-2" />
                {note.isArchived ? 'Restore' : 'Archive'}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(note.id)
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className={cn(
        'pt-0',
        viewMode === 'list' && 'py-2'
      )}>
        {/* Content Preview */}
        <p className={cn(
          'text-muted-foreground leading-relaxed',
          viewMode === 'grid' ? 'text-sm line-clamp-3' : 'text-base line-clamp-2',
          note.isArchived && 'opacity-70'
        )}>
          {truncateContent(
            note.content.replace(/[#*_`~]/g, ''), // Remove markdown
            viewMode === 'grid' ? 120 : 200
          )}
        </p>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {note.tags.slice(0, viewMode === 'grid' ? 2 : 4).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
            {note.tags.length > (viewMode === 'grid' ? 2 : 4) && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{note.tags.length - (viewMode === 'grid' ? 2 : 4)}
              </Badge>
            )}
          </div>
        )}

        {/* Author (if different from current user) */}
        {viewMode === 'list' && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>By {note.author.name || note.author.email}</span>
            </div>
            
            {note.lastViewedAt && (
              <span className="text-xs text-muted-foreground">
                Last viewed {formatDate(note.lastViewedAt)}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}