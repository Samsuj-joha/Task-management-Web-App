// src/app/api/upload/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image' or 'file'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type based on upload type
    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File must be an image' },
          { status: 400 }
        )
      }
    } else {
      // Allow common document types
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/json',
        'application/zip',
        'application/x-zip-compressed'
      ]

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'File type not allowed' },
          { status: 400 }
        )
      }
    }

    // Validate file size
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for images, 10MB for files
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    
    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'chat', type)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Save file
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // Return the public URL
    const fileUrl = `/uploads/chat/${type}/${fileName}`

    console.log(`Chat file uploaded successfully: ${fileUrl}`)

    return NextResponse.json({ 
      url: fileUrl,
      fileName: file.name,
      fileSize: file.size,
      type: file.type,
      message: 'File uploaded successfully' 
    })

  } catch (error) {
    console.error('Chat upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle file cleanup (optional endpoint to delete old files)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'No file URL provided' },
        { status: 400 }
      )
    }

    // Extract filename and type from URL
    const urlParts = fileUrl.split('/')
    const fileName = urlParts.pop()
    const type = urlParts.pop()

    if (!fileName || !type) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      )
    }

    // Delete file
    const filePath = join(process.cwd(), 'public', 'uploads', 'chat', type, fileName)
    
    try {
      const fs = require('fs').promises
      await fs.unlink(filePath)
      console.log(`Chat file deleted: ${filePath}`)
    } catch (error) {
      console.warn(`Failed to delete file: ${filePath}`, error)
      // Don't fail the request if file doesn't exist
    }

    return NextResponse.json({ 
      message: 'File deleted successfully' 
    })

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}