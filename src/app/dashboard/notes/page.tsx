// src/app/dashboard/notes/page.tsx - Updated to use Enhanced Create Dialog
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
import { useNotes, useNoteCategories, usePinNote, useArchiveNote, useDeleteNote } from '@/hooks/use-notes'
import { NoteEditor } from '@/components/notes/note-editor'
import { NoteCard } from '@/components/notes/note-card'
import { CreateNoteDialog } from '@/components/notes/create-note-dialog' // Enhanced version
import { EnhancedNoteEditor } from '@/components/notes/enhanced-note-editor'
import {
  Search,
  Plus,
  StickyNote,
  Pin,
  Archive,
  BookOpen,
  Grid,
  List,
  Clock,
  PinIcon,
  Brain,
  Sparkles,
  Zap
} from 'lucide-react'

export default function NotesPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || 'recent'
  
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [useEnhancedEditor, setUseEnhancedEditor] = useState(true)

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
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Editor Toggle */}
          <Button
            variant={useEnhancedEditor ? "default" : "outline"}
            size="sm"
            onClick={() => setUseEnhancedEditor(!useEnhancedEditor)}
            className="text-xs"
          >
            <Brain className="h-4 w-4 mr-1" />
            {useEnhancedEditor ? 'AI Editor' : 'Basic Editor'}
            {useEnhancedEditor && <Sparkles className="h-3 w-3 ml-1" />}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Enhanced Create Note Button */}
          <Button 
            size="lg" 
            className="font-medium"
            onClick={() => {
              console.log('🎯 Create note button clicked')
              setShowCreateDialog(true)
            }}
          >
            <Zap className="h-4 w-4 mr-2" />
            New Note with AI
            <Sparkles className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Notes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Pinned</p>
              <p className="text-2xl font-bold">{stats.pinned}</p>
            </div>
            <Pin className="h-8 w-8 text-amber-600" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Recent</p>
              <p className="text-2xl font-bold">{stats.recent}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="text-2xl font-bold">{stats.archived}</p>
            </div>
            <Archive className="h-8 w-8 text-gray-600" />
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            <p className="text-muted-foreground mb-6">
              {search || (selectedCategory && selectedCategory !== 'all')
                ? 'Try adjusting your filters or search terms'
                : 'Create your first note with AI-powered task suggestions'
              }
            </p>
            <Button 
              size="lg"
              onClick={() => {
                console.log('🎯 Create first note button clicked')
                setShowCreateDialog(true)
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Create Your First Note
              <Sparkles className="h-3 w-3 ml-1" />
            </Button>
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

      {/* Create Note Dialog */}
      <CreateNoteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        categories={categories}
      />

      {/* Note Editor Dialog - AI Enhanced or Basic */}
      {selectedNote && useEnhancedEditor && (
        <EnhancedNoteEditor
          noteId={selectedNote}
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          categories={categories}
        />
      )}

      {selectedNote && !useEnhancedEditor && (
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