// src/components/chat/enhanced-chat.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useSocket } from '@/hooks/use-socket'
import { toast } from 'sonner'
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image, 
  FileText, 
  X, 
  Download, 
  Upload,
  Loader2,
  MessageCircle,
  Users,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  MoreVertical,
  Copy,
  Reply,
  Forward,
  Star,
  Trash2
} from 'lucide-react'

// Emoji data - You can expand this or use an emoji library
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestures': ['👍', '👎', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Objects': ['💻', '⌚', '📱', '💡', '🔧', '🔨', '⚙️', '🔩', '⚡', '🔥', '💧', '🌟', '⭐', '✨', '💎', '🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎪', '🎯', '🏆', '🥇', '🥈', '🥉'],
  'Work': ['📊', '📈', '📉', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗂️', '📂', '📁', '📄', '📃', '📑', '📜', '📰', '🗞️', '📚', '📖', '📕', '📗', '📘', '📙', '📓']
}

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'file'
  timestamp: Date
  senderId: string
  senderName: string
  senderImage?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  isRead?: boolean
  isDelivered?: boolean
  replyTo?: {
    id: string
    content: string
    senderName: string
  }
}

interface EnhancedChatProps {
  roomId?: string
  recipientId?: string
  recipientName?: string
  isGroup?: boolean
}

export function EnhancedChat({ 
  roomId, 
  recipientId, 
  recipientName, 
  isGroup = false 
}: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { isConnected, socket } = useSocket()

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message])
      
      // Mark as delivered if not from current user
      if (message.senderId !== socket.id) {
        socket.emit('message_delivered', { messageId: message.id })
      }
    }

    const handleTypingStart = (data: { userId: string, userName: string }) => {
      setTypingUsers(prev => [...prev.filter(u => u !== data.userName), data.userName])
    }

    const handleTypingStop = (data: { userId: string, userName: string }) => {
      setTypingUsers(prev => prev.filter(u => u !== data.userName))
    }

    const handleMessageDelivered = (data: { messageId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isDelivered: true } : msg
      ))
    }

    const handleMessageRead = (data: { messageId: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ))
    }

    socket.on('new_message', handleNewMessage)
    socket.on('typing_start', handleTypingStart)
    socket.on('typing_stop', handleTypingStop)
    socket.on('message_delivered', handleMessageDelivered)
    socket.on('message_read', handleMessageRead)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('typing_start', handleTypingStart)
      socket.off('typing_stop', handleTypingStop)
      socket.off('message_delivered', handleMessageDelivered)
      socket.off('message_read', handleMessageRead)
    }
  }, [socket, isConnected])

  // Typing indicator
  useEffect(() => {
    if (!socket || !newMessage.trim()) return

    const startTyping = () => {
      socket.emit('typing_start', { roomId, recipientId })
      setIsTyping(true)
    }

    const stopTyping = () => {
      socket.emit('typing_stop', { roomId, recipientId })
      setIsTyping(false)
    }

    startTyping()
    const timer = setTimeout(stopTyping, 1000)

    return () => {
      clearTimeout(timer)
      stopTyping()
    }
  }, [newMessage, socket, roomId, recipientId])

  // Send message function
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' = 'text', fileData?: any) => {
    if (!content.trim() && type === 'text') return
    if (!socket || !isConnected) {
      toast.error('Not connected to chat server')
      return
    }

    const messageData = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date(),
      roomId,
      recipientId,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        senderName: replyingTo.senderName
      } : undefined,
      ...fileData
    }

    // Add to local messages immediately for better UX
    const localMessage: Message = {
      ...messageData,
      senderId: socket.id || 'me',
      senderName: 'You',
      isDelivered: false,
      isRead: false
    }

    setMessages(prev => [...prev, localMessage])
    setNewMessage('')
    setReplyingTo(null)

    // Send to server
    socket.emit('send_message', messageData)
  }, [socket, isConnected, roomId, recipientId, replyingTo])

  // Handle text message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(newMessage)
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | null, type: 'file' | 'image') => {
    if (!files || files.length === 0) return
    
    const file = files[0]
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for images, 10MB for files
    
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload/chat', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()

      // Send message with file data
      await sendMessage(
        type === 'image' ? 'Shared an image' : file.name,
        type,
        {
          fileUrl: result.url,
          fileName: file.name,
          fileSize: file.size
        }
      )

      toast.success(`${type === 'image' ? 'Image' : 'File'} uploaded successfully`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  // Message actions
  const handleMessageAction = (action: string, message: Message) => {
    switch (action) {
      case 'reply':
        setReplyingTo(message)
        textareaRef.current?.focus()
        break
      case 'copy':
        navigator.clipboard.writeText(message.content)
        toast.success('Message copied to clipboard')
        break
      case 'forward':
        // Implement forward functionality
        toast.info('Forward functionality coming soon')
        break
      case 'star':
        // Implement star functionality
        toast.success('Message starred')
        break
      case 'delete':
        // Implement delete functionality
        toast.success('Message deleted')
        break
    }
  }

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={message.fileUrl} 
              alt="Shared image" 
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.content !== 'Shared an image' && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        )
      case 'file':
        return (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-xs">
            <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{message.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {message.fileSize ? (message.fileSize / 1024 / 1024).toFixed(1) + ' MB' : 'Unknown size'}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0"
              onClick={() => window.open(message.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
    }
  }

  // Render emoji picker
  const renderEmojiPicker = () => (
    <div className="w-80 p-4 bg-background border rounded-lg shadow-lg">
      <div className="space-y-3">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map(emoji => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  <span className="text-lg">{emoji}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-4xl">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {isGroup ? <Users className="h-5 w-5" /> : recipientName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">
              {isGroup ? 'Team Chat' : recipientName || 'Chat'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isConnected ? (
                <>
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 bg-gray-400 rounded-full" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSelectionMode && (
            <Badge variant="secondary">
              {selectedMessages.size} selected
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsSelectionMode(!isSelectionMode)}>
                {isSelectionMode ? 'Exit Selection' : 'Select Messages'}
              </DropdownMenuItem>
              <DropdownMenuItem>Clear Chat History</DropdownMenuItem>
              <DropdownMenuItem>Export Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 group ${
                  message.senderId === socket?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.senderId !== socket?.id && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.senderImage ? (
                      <AvatarImage src={message.senderImage} alt={message.senderName} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div 
                  className={`max-w-[70%] ${
                    message.senderId === socket?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  } rounded-lg px-3 py-2 relative group`}
                >
                  {/* Reply indicator */}
                  {message.replyTo && (
                    <div className="mb-2 p-2 bg-black/10 rounded border-l-2 border-border">
                      <p className="text-xs opacity-75">{message.replyTo.senderName}</p>
                      <p className="text-xs truncate">{message.replyTo.content}</p>
                    </div>
                  )}

                  {/* Message content */}
                  {renderMessageContent(message)}

                  {/* Message metadata */}
                  <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.senderId === socket?.id && (
                      <>
                        {message.isRead ? (
                          <CheckCheck className="h-3 w-3 text-blue-400" />
                        ) : message.isDelivered ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Message actions */}
                  <div className="absolute -top-2 right-2 hidden group-hover:flex bg-background border rounded-lg shadow-sm">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleMessageAction('reply', message)}
                    >
                      <Reply className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleMessageAction('copy', message)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleMessageAction('forward', message)}>
                          <Forward className="h-4 w-4 mr-2" />
                          Forward
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMessageAction('star', message)}>
                          <Star className="h-4 w-4 mr-2" />
                          Star
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleMessageAction('delete', message)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {message.senderId === socket?.id && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce delay-75" />
                  <div className="h-2 w-2 bg-current rounded-full animate-bounce delay-150" />
                </div>
                <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="border-t p-3 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Replying to {replyingTo.senderName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* File upload buttons */}
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="min-h-[40px] max-h-32 resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e as any)
                }
              }}
            />
            
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 bottom-1 h-8 w-8"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" side="top">
                {renderEmojiPicker()}
              </PopoverContent>
            </Popover>
          </div>

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || isUploading || !isConnected}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, 'file')}
        accept=".pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, 'image')}
        accept="image/*"
      />
    </Card>
  )
}