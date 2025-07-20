// src/components/notes/create-note-dialog.tsx - CLEAN VERSION
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
  DialogTrigger,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCreateNote, NoteCategory } from '@/hooks/use-notes'
import { AITaskSuggestionsPanel } from './ai-task-suggestions-panel'
import { 
  X, 
  Plus, 
  Tag, 
  Pin, 
  AlertTriangle, 
  Brain, 
  Eye, 
  EyeOff,
  Sparkles,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional(),
  isPinned: z.boolean().default(false),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  tags: z.array(z.string()).default([])
})

type CreateNoteForm = z.infer<typeof createNoteSchema>

interface CreateNoteDialogProps {
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: NoteCategory[]
}

export function CreateNoteDialog({ 
  children, 
  open, 
  onOpenChange, 
  categories 
}: CreateNoteDialogProps) {
  const [newTag, setNewTag] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showAISuggestions, setShowAISuggestions] = useState(true)
  const [currentContent, setCurrentContent] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')
  
  const createNote = useCreateNote()

  const form = useForm<CreateNoteForm>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      isPinned: false,
      priority: 'MEDIUM',
      tags: []
    }
  })

  // Watch form changes for AI analysis
  const watchedTitle = form.watch('title')
  const watchedContent = form.watch('content')

  useEffect(() => {
    setCurrentTitle(watchedTitle || '')
    setCurrentContent(watchedContent || '')
  }, [watchedTitle, watchedContent])

  // Reset form completely when dialog opens
  useEffect(() => {
    if (open) {
      console.log('🔄 Dialog opened - resetting form')
      
      // Force reset form to default values
      setTimeout(() => {
        form.reset({
          title: '',
          content: '',
          categoryId: '',
          isPinned: false,
          priority: 'MEDIUM',
          tags: []
        })
        
        // Reset local state
        setTags([])
        setNewTag('')
        setCurrentContent('')
        setCurrentTitle('')
        setShowAISuggestions(true)
        
        console.log('✅ Form completely reset')
      }, 50)
    }
  }, [open, form])
  
  // Additional cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      console.log('🔄 Dialog closed - cleaning up')
      
      setTimeout(() => {
        form.reset({
          title: '',
          content: '',
          categoryId: '',
          isPinned: false,
          priority: 'MEDIUM',
          tags: []
        })
        
        setTags([])
        setNewTag('')
        setCurrentContent('')
        setCurrentTitle('')
      }, 100)
    }
  }, [open, form])

  const onSubmit = async (data: CreateNoteForm) => {
    try {
      console.log('🚀 Creating note with data:', data)
      
      await createNote.mutateAsync({
        ...data,
        tags,
        categoryId: data.categoryId === 'none' ? undefined : data.categoryId
      })
      
      console.log('✅ Note created successfully')
      
      // Reset everything immediately before closing
      form.reset({
        title: '',
        content: '',
        categoryId: '',
        isPinned: false,
        priority: 'MEDIUM',
        tags: []
      })
      
      setTags([])
      setNewTag('')
      setCurrentContent('')
      setCurrentTitle('')
      setShowAISuggestions(true)
      
      // Small delay to ensure state is reset
      setTimeout(() => {
        onOpenChange(false)
      }, 100)
      
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
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

  // Handle close - clean reset
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      
      {/* Clean Modal - Centered, Proper Width */}
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0 mx-auto">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between space-y-0 p-4 border-b bg-background">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-lg font-semibold">Create New Note</DialogTitle>
            {(currentTitle || currentContent) && (
              <Badge variant="outline" className="text-xs">
                <Brain className="h-3 w-3 mr-1" />
                AI Analyzing...
              </Badge>
            )}
          </div>

          {/* AI Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className="text-xs"
            >
              <Brain className={cn("h-4 w-4 mr-1", showAISuggestions ? "text-blue-600" : "text-muted-foreground")} />
              AI Suggestions
              {showAISuggestions ? <EyeOff className="h-3 w-3 ml-1" /> : <Eye className="h-3 w-3 ml-1" />}
            </Button>
          </div>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Panel - Note Form */}
          <div className={cn(
            "overflow-hidden transition-all duration-200",
            showAISuggestions ? "flex-1" : "w-full"
          )}>
            <ScrollArea className="h-full w-full">
              <div className="p-6 max-w-none">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter note title..." 
                              {...field} 
                              autoFocus
                              className="text-lg h-12 w-full"
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
                          <FormLabel className="text-base font-medium">Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Write your note content here... (AI will analyze and suggest tasks)"
                              className="min-h-[250px] resize-none text-base leading-relaxed w-full"
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
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="h-11 w-full">
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

                      {/* Priority */}
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="h-11 w-full">
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
                      <FormLabel className="flex items-center space-x-2 text-base font-medium">
                        <Tag className="h-4 w-4" />
                        <span>Tags</span>
                      </FormLabel>
                      
                      {/* Add Tag Input */}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 h-11"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={addTag}
                          disabled={!newTag.trim() || tags.includes(newTag.trim())}
                          className="h-11 px-4"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>

                      {/* Tags Display */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="flex items-center space-x-1 text-sm py-1 px-3"
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
                              onCheckedChange={field.onChange}
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

          {/* Right Panel - AI Task Suggestions */}
          {showAISuggestions && (
            <>
              <Separator orientation="vertical" className="h-full" />
              <div className="w-80 flex-shrink-0 bg-muted/20">
                <AITaskSuggestionsPanel
                  noteContent={currentContent}
                  noteTitle={currentTitle}
                  className="h-full border-0 bg-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t bg-background">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {(currentTitle || currentContent) && showAISuggestions && (
                <>
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span>AI is analyzing your content for task suggestions</span>
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createNote.isPending}
                className="min-w-20"
              >
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={createNote.isPending}
                className="min-w-28"
              >
                {createNote.isPending ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
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