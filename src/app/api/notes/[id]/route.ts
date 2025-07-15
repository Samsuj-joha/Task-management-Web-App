// src/app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  categoryId: z.string().nullable().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  tags: z.array(z.string()).optional(),
  lastViewedAt: z.string().optional()
})

// GET /api/notes/[id] - Get single note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(note)

  } catch (error) {
    console.error('GET /api/notes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

// PATCH /api/notes/[id] - Update note
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateNoteSchema.parse(body)

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Update note
    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        ...(validatedData.lastViewedAt && {
          lastViewedAt: new Date(validatedData.lastViewedAt)
        })
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedNote)

  } catch (error) {
    console.error('PATCH /api/notes/[id] error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if note exists and belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Delete note
    await prisma.note.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })

  } catch (error) {
    console.error('DELETE /api/notes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}