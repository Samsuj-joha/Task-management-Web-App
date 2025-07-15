// src/app/dashboard/notes/page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useNotes, useNoteCategories, usePinNote, useArchiveNote, useDeleteNote } from '@/hooks/use-notes'
import { NoteEditor } from '@/components/notes/note-editor'
import { NoteCard } from '@/components/notes/note-card'
import { CreateNoteDialog } from '@/components/notes/create-note-dialog'
import {
  Search,
  Plus,
  StickyNote,
  Pin,
  Archive,
  MoreVertical,
  Edit,
  Trash2,
  BookOpen,
  Filter,
  Grid,
  List,
  Clock,
  PinIcon,
  Tag
} from 'lucide-react'

export default function NotesPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'recent'
  
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Fetch data
  const { data: notesData, isLoading: notesLoading } = useNotes({
    filter: filter as any,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
    search: search || undefined
  })
  
  const { data: categoriesData } = useNoteCategories()
  
  // Mutations
  const pinNote = usePinNote()
  const archiveNote = useArchiveNote()
  const deleteNote = useDeleteNote()

  const notes = notesData?.notes || []
  const categories = categoriesData?.categories || []

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.categoryId === selectedCategory)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }, [notes, selectedCategory, search])

  // Get stats
  const stats = useMemo(() => {
    const total = notes.length
    const pinned = notes.filter(n => n.isPinned && !n.isArchived).length
    const archived = notes.filter(n => n.isArchived).length
    const recent = notes.filter(n => !n.isArchived).length

    return { total, pinned, archived, recent }
  }, [notes])

  const handlePinNote = (noteId: string, isPinned: boolean) => {
    pinNote.mutate({ id: noteId, isPinned: !isPinned })
  }

  const handleArchiveNote = (noteId: string, isArchived: boolean) => {
    archiveNote.mutate({ id: noteId, isArchived: !isArchived })
  }

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote.mutate(noteId)
    }
  }

  const getFilterTitle = () => {
    switch (filter) {
      case 'pinned': return 'Pinned Notes'
      case 'archived': return 'Archived Notes'
      case 'recent': return 'Recent Notes'
      default: return 'All Notes'
    }
  }

  const getFilterIcon = () => {
    switch (filter) {
      case 'pinned': return <PinIcon className="h-5 w-5" />
      case 'archived': return <Archive className="h-5 w-5" />
      case 'recent': return <Clock className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getFilterIcon()}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{getFilterTitle()}</h1>
            <p className="text-muted-foreground">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              {selectedCategory && selectedCategory !== 'all' && (
                <span className="ml-1">
                  in {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Create Note Button */}
          <CreateNoteDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            categories={categories}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </CreateNoteDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Notes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PinIcon className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium">Pinned</p>
                <p className="text-2xl font-bold">{stats.pinned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Recent</p>
                <p className="text-2xl font-bold">{stats.recent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Archived</p>
                <p className="text-2xl font-bold">{stats.archived}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, content, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                  {category._count && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {category._count.notes}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Notes Grid/List */}
      <div className="flex-1 overflow-hidden">
        {notesLoading ? (
          <div className={cn(
            'grid gap-4',
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4">
              {search || (selectedCategory && selectedCategory !== 'all')
                ? 'Try adjusting your filters or search terms'
                : 'Create your first note to get started'
              }
            </p>
            <CreateNoteDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              categories={categories}
            >
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </CreateNoteDialog>
          </div>
        ) : (
          <div className={cn(
            'grid gap-4 pb-6',
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          )}>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                onEdit={(id) => setSelectedNote(id)}
                onPin={(id, isPinned) => handlePinNote(id, isPinned)}
                onArchive={(id, isArchived) => handleArchiveNote(id, isArchived)}
                onDelete={(id) => handleDeleteNote(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Editor Dialog */}
      {selectedNote && (
        <NoteEditor
          noteId={selectedNote}
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          categories={categories}
        />
      )}
    </div>
  )
}