// src/components/notes/note-editor.tsx - FIXED WITH PROPER OVERFLOW
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  AlertTriangle,
  Loader2
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
  const { data: note, isLoading, error } = useNote(noteId)
  
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
      console.log('Loading note data into form:', note)
      form.reset({
        title: note.title || '',
        content: note.content || '',
        categoryId: note.categoryId || '',
        isPinned: note.isPinned || false,
        priority: note.priority || 'MEDIUM',
        tags: note.tags || []
      })
      setTags(note.tags || [])
      
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
      console.log('Submitting note update:', data)
      await updateNote.mutateAsync({
        id: noteId,
        data: {
          ...data,
          tags,
          categoryId: data.categoryId === '' ? undefined : data.categoryId
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

  const handlePin = async () => {
    if (note) {
      try {
        await pinNote.mutateAsync({ id: noteId, isPinned: !note.isPinned })
      } catch (error) {
        console.error('Failed to pin/unpin note:', error)
      }
    }
  }

  const handleArchive = async () => {
    if (note) {
      try {
        await archiveNote.mutateAsync({ id: noteId, isArchived: !note.isArchived })
        if (!note.isArchived) {
          onClose() // Close editor when archiving
        }
      } catch (error) {
        console.error('Failed to archive note:', error)
      }
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await deleteNote.mutateAsync(noteId)
        onClose()
      } catch (error) {
        console.error('Failed to delete note:', error)
      }
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

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-4xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b pb-4">
            <Skeleton className="h-6 w-48" />
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6">
            <div className="space-y-4 h-full overflow-y-auto">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md h-auto">
          <DialogHeader>
            <DialogTitle>Error Loading Note</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Failed to load note. Please try again.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Note not found
  if (!note) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md h-auto">
          <DialogHeader>
            <DialogTitle>Note Not Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              The note you're looking for doesn't exist.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-5xl h-[95vh] max-h-[95vh] overflow-hidden flex flex-col p-0">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 p-6 border-b bg-background">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <DialogTitle className="truncate">Edit Note</DialogTitle>
            {note.isPinned && (
              <Pin className="h-4 w-4 text-amber-600 flex-shrink-0" />
            )}
            {note.isArchived && (
              <Archive className="h-4 w-4 text-gray-500 flex-shrink-0" />
            )}
            {hasChanges && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                Unsaved changes
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePin}
              disabled={pinNote.isPending}
              className="whitespace-nowrap"
            >
              {pinNote.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pin className="h-4 w-4 mr-1" />
              )}
              {note.isPinned ? 'Unpin' : 'Pin'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={archiveNote.isPending}
              className="whitespace-nowrap"
            >
              {archiveNote.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4 mr-1" />
              )}
              {note.isArchived ? 'Restore' : 'Archive'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteNote.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
            >
              {deleteNote.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        </DialogHeader>

        {/* Note Info */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 mx-6 bg-muted/30 rounded-lg text-sm">
          <div className="flex items-center space-x-2 min-w-0">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground flex-shrink-0">Created by:</span>
            <span className="truncate">{note.author.name || note.author.email}</span>
          </div>
          
          <div className="flex items-center space-x-2 min-w-0">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground flex-shrink-0">Updated:</span>
            <span className="truncate">{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
          </div>

          {note.lastViewedAt && (
            <div className="flex items-center space-x-2 min-w-0">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground flex-shrink-0">Last viewed:</span>
              <span className="truncate">{formatDistanceToNow(new Date(note.lastViewedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        <Separator className="flex-shrink-0" />

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="p-6">
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
                            className="text-lg font-medium"
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
                            className="min-h-[200px] max-h-[300px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category and Priority Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              <SelectItem value="">No category</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: category.color }}
                                    />
                                    <span className="truncate">{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              {priorityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className={`flex items-center space-x-2 ${option.color}`}>
                                    {option.value === 'URGENT' && <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
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

                    {/* Add new tag */}
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
                        className="flex-shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Tags Display */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                        {tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="flex items-center space-x-1 flex-shrink-0"
                          >
                            <span className="truncate max-w-[100px]">{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 flex-shrink-0"
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
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <FormLabel className="flex items-center space-x-2 cursor-pointer">
                            <Pin className="h-4 w-4 flex-shrink-0" />
                            <span>Pin this note</span>
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Pinned notes appear at the top of your notes list
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="flex-shrink-0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </ScrollArea>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t bg-background">
          <div className="flex justify-between p-6">
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={updateNote.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateNote.isPending || !hasChanges}
                className="min-w-32"
              >
                {updateNote.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}