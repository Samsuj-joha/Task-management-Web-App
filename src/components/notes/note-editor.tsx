// src/components/notes/note-editor.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDistanceToNow } from 'date-fns'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  useNote, 
  useUpdateNote, 
  useUpdateLastViewed,
  useDeleteNote,
  usePinNote,
  useArchiveNote,
  NoteCategory 
} from '@/hooks/use-notes'
import { 
  Save, 
  X, 
  Pin, 
  Archive, 
  Trash2, 
  Tag, 
  Clock, 
  User,
  Plus,
  AlertTriangle
} from 'lucide-react'

const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional(),
  isPinned: z.boolean().default(false),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  tags: z.array(z.string()).default([])
})

type UpdateNoteForm = z.infer<typeof updateNoteSchema>

interface NoteEditorProps {
  noteId: string
  open: boolean
  onClose: () => void
  categories: NoteCategory[]
}

export function NoteEditor({ noteId, open, onClose, categories }: NoteEditorProps) {
  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  
  // Fetch note data
  const { data: note, isLoading } = useNote(noteId)
  
  // Mutations
  const updateNote = useUpdateNote()
  const updateLastViewed = useUpdateLastViewed()
  const deleteNote = useDeleteNote()
  const pinNote = usePinNote()
  const archiveNote = useArchiveNote()

  const form = useForm<UpdateNoteForm>({
    resolver: zodResolver(updateNoteSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      isPinned: false,
      priority: 'MEDIUM',
      tags: []
    }
  })

  // Update form when note data loads
  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        categoryId: note.categoryId || 'none',
        isPinned: note.isPinned,
        priority: note.priority,
        tags: note.tags
      })
      setTags(note.tags)
      
      // Update last viewed timestamp
      updateLastViewed.mutate(noteId)
    }
  }, [note, form, noteId, updateLastViewed])

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (data: UpdateNoteForm) => {
    try {
      await updateNote.mutateAsync({
        id: noteId,
        data: {
          ...data,
          tags,
          categoryId: data.categoryId === 'none' ? undefined : data.categoryId
        }
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const handlePin = () => {
    if (note) {
      pinNote.mutate({ id: noteId, isPinned: !note.isPinned })
    }
  }

  const handleArchive = () => {
    if (note) {
      archiveNote.mutate({ id: noteId, isArchived: !note.isArchived })
      if (!note.isArchived) {
        onClose() // Close editor when archiving
      }
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      deleteNote.mutate(noteId)
      onClose()
    }
  }

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

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'text-gray-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-blue-600' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600' }
  ]

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!note) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit Note</span>
            {note.isPinned && (
              <Pin className="h-4 w-4 text-amber-600" />
            )}
            {note.isArchived && (
              <Archive className="h-4 w-4 text-gray-500" />
            )}
          </DialogTitle>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePin}
              disabled={pinNote.isPending}
            >
              <Pin className="h-4 w-4 mr-1" />
              {note.isPinned ? 'Unpin' : 'Pin'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={archiveNote.isPending}
            >
              <Archive className="h-4 w-4 mr-1" />
              {note.isArchived ? 'Restore' : 'Archive'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteNote.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </DialogHeader>

        {/* Note Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created by:</span>
            <span>{note.author.name || note.author.email}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
          </div>

          {note.lastViewedAt && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last viewed:</span>
              <span>{formatDistanceToNow(new Date(note.lastViewedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter note title..." 
                      {...field} 
                      className="text-lg font-semibold"
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
                      placeholder="Write your note content here..."
                      className="min-h-64 resize-none font-mono"
                      {...field}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className={`flex items-center space-x-2 ${option.color}`}>
                              {option.value === 'URGENT' || option.value === 'HIGH' ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : null}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <FormLabel className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </FormLabel>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="flex items-center space-x-1"
                    >
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
                    <FormLabel className="flex items-center space-x-2 cursor-pointer">
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
            <div className="flex justify-end space-x-2 pt-4">
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
                  'Saving...'
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
      </DialogContent>
    </Dialog>
  )
}