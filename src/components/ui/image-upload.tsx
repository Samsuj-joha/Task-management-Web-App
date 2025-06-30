// src/components/ui/image-upload.tsx (COMPLETE FIXED VERSION)
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Camera, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  currentImage?: string
  displayName: string
  initials: string
  onImageChange: (imageUrl: string) => void
  className?: string
}

export function ImageUpload({ 
  currentImage, 
  displayName, 
  initials, 
  onImageChange,
  className = ""
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewImage(result)
    }
    reader.readAsDataURL(file)

    // Upload the image
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true)
      console.log('Starting image upload process...')

      // Step 1: Upload file to server
      const formData = new FormData()
      formData.append('image', file)

      console.log('Uploading file to /api/upload/image...')
      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const uploadResult = await uploadResponse.json()
      console.log('File upload successful, received:', uploadResult)
      
      if (!uploadResult.url) {
        throw new Error('No URL returned from upload')
      }

      // Step 2: Update profile in database
      console.log('Updating profile with image URL:', uploadResult.url)
      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: uploadResult.url 
        })
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(`Profile update failed: ${errorData.error || 'Unknown error'}`)
      }

      const profileResult = await profileResponse.json()
      console.log('Profile update successful:', profileResult)

      // Step 3: Update local state
      onImageChange(uploadResult.url)
      setPreviewImage(null)
      
      // Step 4: Notify other components
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { user: profileResult.user } 
      }))
      
      toast.success('Profile image updated successfully!')
      console.log('Image upload process completed successfully')

    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setPreviewImage(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = async () => {
    try {
      console.log('Removing profile image...')
      
      // Update profile to remove image
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: '' }),
      })

      if (response.ok) {
        const result = await response.json()
        onImageChange('')
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { user: result.user } 
        }))
        
        toast.success('Profile image removed')
        console.log('Image removed successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove image')
      }
    } catch (error) {
      console.error('Remove image error:', error)
      toast.error(`Failed to remove image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const displayImage = previewImage || currentImage

  return (
    <div className={`relative ${className}`}>
      <Avatar className="h-24 w-24 mx-auto">
        {displayImage ? (
          <AvatarImage 
            src={displayImage} 
            alt={displayName}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Upload/Camera Button */}
      <Button
        size="icon"
        variant="outline"
        className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
        onClick={triggerFileSelect}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>

      {/* Remove Button (only show if image exists) */}
      {currentImage && !previewImage && !isUploading && (
        <Button
          size="icon"
          variant="destructive"
          className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
          onClick={removeImage}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}