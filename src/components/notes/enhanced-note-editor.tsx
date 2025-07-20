// src/components/notes/enhanced-note-editor.tsx - Note Editor with AI Suggestions
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AITaskSuggestionsPanel } from './ai-task-suggestions-panel'
import { useNote, useUpdateNote, useDeleteNote, usePinNote, useArchiveNote, useNoteCategories } from '@/hooks/use-notes'
import { formatDistanceToNow } from 'date-fns'
import {
  Save,
  Pin,
  Archive,
  Trash2,
  X,
  Plus,
  User,
  Clock,
  Brain,
  Sparkles,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  isPinned: z.boolean(),
  tags: z.array(z.string())
})

type NoteFormData = z.infer<typeof noteSchema>

interface EnhancedNoteEditorProps {
  noteId: string
  open: boolean
  onClose: () => void
  categories?: Array<{
    id: string
    name: string
    color: string
    icon?: string
  }>
}

export function EnhancedNoteEditor({
  noteId,
  open,
  onClose,
  categories = []
}: EnhancedNoteEditorProps) {
  
  const [hasChanges, setHasChanges] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showAISuggestions, setShowAISuggestions] = useState(true)
  const [currentContent, setCurrentContent] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  // API hooks
  const { data: note, isLoading } = useNote(noteId)
  const { data: categoriesData } = useNoteCategories()
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const pinNote = usePinNote()
  const archiveNote = useArchiveNote()

  const availableCategories = categories.length > 0 ? categories : (categoriesData?.categories || [])

  // Form setup
  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: 'none',
      priority: 'MEDIUM',
      isPinned: false,
      tags: []
    }
  })

  // Initialize form when note loads
  useEffect(() => {
    if (note) {
      const formData = {
        title: note.title,
        content: note.content,
        categoryId: note.categoryId || 'none',
        priority: note.priority,
        isPinned: note.isPinned,
        tags: note.tags
      }
      
      form.reset(formData)
      setTags(note.tags)
      setCurrentContent(note.content)
      setCurrentTitle(note.title)
      setHasChanges(false)
    }
  }, [note, form])

  // Watch form changes for AI analysis
  const watchedTitle = form.watch('title')
  const watchedContent = form.watch('content')

  useEffect(() => {
    setCurrentTitle(watchedTitle)
    setCurrentContent(watchedContent)
    
    if (note) {
      const hasFormChanges = 
        watchedTitle !== note.title ||
        watchedContent !== note.content ||
        JSON.stringify(tags) !== JSON.stringify(note.tags)
      
      setHasChanges(hasFormChanges)
    }
  }, [watchedTitle, watchedContent, tags, note])

  // Form submission
  const onSubmit = async (data: NoteFormData) => {
    try {
      // Convert 'none' back to undefined for categoryId
      const submitData = {
        ...data,
        categoryId: data.categoryId === 'none' ? undefined : data.categoryId,
        tags
      }
      
      await updateNote.mutateAsync({
        id: noteId,
        data: submitData
      })
      setHasChanges(false)
      toast.success('Note updated successfully!')
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  // Handle close with unsaved changes
  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  // Quick actions
  const handlePin = () => {
    if (note) {
      pinNote.mutate({ id: noteId, isPinned: !note.isPinned })
    }
  }

  const handleArchive = () => {
    if (note) {
      archiveNote.mutate({ id: noteId, isArchived: !note.isArchived })
      if (!note.isArchived) {
        onClose()
      }
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNote.mutate(noteId)
      onClose()
    }
  }

  // Tag management
  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag('')
      setHasChanges(true)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    setHasChanges(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (isLoading || !note) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Edit Note
              {note.isPinned && <Pin className="h-4 w-4 text-amber-600" />}
              {note.isArchived && <Archive className="h-4 w-4 text-gray-500" />}
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </DialogTitle>

            <div className="flex items-center gap-2">
              {/* AI Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                className="text-xs"
              >
                <Brain className={cn("h-4 w-4 mr-1", showAISuggestions ? "text-blue-600" : "text-muted-foreground")} />
                {showAISuggestions ? <EyeOff className="h-3 w-3 ml-1" /> : <Eye className="h-3 w-3 ml-1" />}
              </Button>

              {/* Quick Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePin}
                disabled={pinNote.isPending}
              >
                <Pin className="h-4 w-4 mr-1" />
                {note.isPinned ? 'Unpin' : 'Pin'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
                disabled={archiveNote.isPending}
              >
                <Archive className="h-4 w-4 mr-1" />
                {note.isArchived ? 'Restore' : 'Archive'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteNote.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          {/* Note metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Author:</span>
              <span>{note.author.name || note.author.email}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Updated:</span>
              <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
            </div>

            {note.lastViewedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last viewed:</span>
                <span>{formatDistanceToNow(new Date(note.lastViewedAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Left Panel - Note Editor */}
          <div className="flex-1 overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter note title..."
                          className="text-lg font-medium"
                          onChange={(e) => {
                            field.onChange(e)
                            setHasChanges(true)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Write your note content here..."
                          className="min-h-[300px] resize-none"
                          onChange={(e) => {
                            field.onChange(e)
                            setHasChanges(true)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            setHasChanges(true)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No category</SelectItem>
                            {availableCategories.map((category) => (
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            setHasChanges(true)
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={!newTag.trim()}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pin Option */}
                <FormField
                  control={form.control}
                  name="isPinned"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 cursor-pointer">
                          <Pin className="h-4 w-4" />
                          <span>Pin this note</span>
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Pinned notes appear at the top of your notes list
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            setHasChanges(true)
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleClose}
                    disabled={updateNote.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateNote.isPending || !hasChanges}
                    className="min-w-24"
                  >
                    {updateNote.isPending ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Right Panel - AI Task Suggestions */}
          {showAISuggestions && (
            <>
              <Separator orientation="vertical" className="h-full" />
              <div className="w-80 flex-shrink-0">
                <AITaskSuggestionsPanel
                  noteContent={currentContent}
                  noteTitle={currentTitle}
                  className="h-full"
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}