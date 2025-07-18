// src/components/chat/enhanced-message-input.tsx
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Send,
  Paperclip,
  Smile,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Emoji data - popular emojis organized by categories
const EMOJI_CATEGORIES = {
  'Smileys & People': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕'],
  'Gestures & Body': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '👀', '👁️', '🧠', '🦷', '🦴'],
  'Activities & Sports': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂'],
  'Objects & Symbols': ['💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮', '🎥', '🎞️', '📹', '📷', '📸', '📱', '☎️', '📞', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏰', '⏰', '⌚', '📡', '🔋', '🔌', '💡', '🔦'],
  'Hearts & Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊']
}

interface FileUpload {
  id: string
  file: File
  preview?: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  url?: string
}

interface EnhancedMessageInputProps {
  roomId?: string
  onSendMessage: (content: string, files?: FileUpload[], replyToId?: string) => Promise<void>
  replyTo?: {
    id: string
    content: string
    sender: { name: string }
  }
  onCancelReply?: () => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}

export function EnhancedMessageInput({
  roomId,
  onSendMessage,
  replyTo,
  onCancelReply,
  placeholder = "Type a message...",
  disabled = false,
  maxLength = 1000
}: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<FileUpload[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [message])

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: FileUpload[] = []
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`)
        continue
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type "${file.type}" is not supported.`)
        continue
      }

      const fileUpload: FileUpload = {
        id: `${Date.now()}-${i}`,
        file,
        progress: 0,
        status: 'uploading'
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          fileUpload.preview = e.target?.result as string
          setFiles(prev => [...prev.filter(f => f.id !== fileUpload.id), fileUpload])
        }
        reader.readAsDataURL(file)
      }

      newFiles.push(fileUpload)
    }

    setFiles(prev => [...prev, ...newFiles])

    // Upload files
    for (const fileUpload of newFiles) {
      await uploadFile(fileUpload)
    }
  }, [roomId])

  // Upload file to server
  const uploadFile = async (fileUpload: FileUpload) => {
    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', fileUpload.file)
      if (roomId) formData.append('roomId', roomId)

      // Simulate upload progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) progress = 90
        
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id ? { ...f, progress } : f
        ))
      }, 100)

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      
      setFiles(prev => prev.map(f => 
        f.id === fileUpload.id 
          ? { ...f, progress: 100, status: 'success', url: data.url }
          : f
      ))

      toast.success(`File "${fileUpload.file.name}" uploaded successfully!`)
      
    } catch (error) {
      console.error('Upload error:', error)
      
      setFiles(prev => prev.map(f => 
        f.id === fileUpload.id 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ))

      toast.error(`Failed to upload "${fileUpload.file.name}"`)
    } finally {
      setIsUploading(false)
    }
  }

  // Remove file
  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Add emoji to message
  const addEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newMessage = message.slice(0, start) + emoji + message.slice(end)
      setMessage(newMessage)
      
      // Move cursor after emoji
      setTimeout(() => {
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
        textarea.focus()
      }, 0)
    } else {
      setMessage(prev => prev + emoji)
    }
    setEmojiOpen(false)
  }

  // Send message
  const handleSend = async () => {
    if (!message.trim() && files.length === 0) return
    if (isSending || isUploading) return

    // Check if all files are uploaded
    const pendingFiles = files.filter(f => f.status === 'uploading')
    if (pendingFiles.length > 0) {
      toast.error('Please wait for all files to upload before sending.')
      return
    }

    const errorFiles = files.filter(f => f.status === 'error')
    if (errorFiles.length > 0) {
      toast.error('Please remove failed uploads before sending.')
      return
    }

    try {
      setIsSending(true)
      
      const successFiles = files.filter(f => f.status === 'success')
      await onSendMessage(message.trim(), successFiles, replyTo?.id)
      
      // Clear input
      setMessage('')
      setFiles([])
      if (onCancelReply) onCancelReply()
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Message sent!')
      
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="border-t bg-background p-4">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-3 p-3 bg-muted rounded-lg border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Replying to {replyTo.sender.name}
              </p>
              <p className="text-sm truncate">
                {replyTo.content.length > 50 
                  ? `${replyTo.content.substring(0, 50)}...` 
                  : replyTo.content
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* File Uploads Preview */}
      {files.length > 0 && (
        <div className="mb-3 space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.file.name}
                    className="h-10 w-10 rounded object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    {getFileIcon(file.file.type)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.file.size)}
                </p>
                
                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="mt-1">
                    <Progress value={file.progress} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploading... {Math.round(file.progress)}%
                    </p>
                  </div>
                )}
                
                {/* Status */}
                {file.status === 'error' && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <p className="text-xs text-red-500">Upload failed</p>
                  </div>
                )}
                
                {file.status === 'success' && (
                  <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>
                )}
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-end gap-2">
        {/* File Upload Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex-shrink-0"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Message Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[120px] resize-none pr-12"
            rows={1}
          />

          {/* Emoji Button */}
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                disabled={disabled}
                type="button"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Choose an emoji</h4>
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                    <div key={category}>
                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h5>
                      <div className="grid grid-cols-8 gap-1">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => addEmoji(emoji)}
                            type="button"
                          >
                            <span className="text-lg">{emoji}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || isSending || isUploading || (!message.trim() && files.length === 0)}
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Press Enter to send, Shift+Enter for new line
        </span>
        <span className={message.length > maxLength * 0.9 ? 'text-orange-500' : ''}>
          {message.length}/{maxLength} characters
        </span>
      </div>
    </div>
  )
}