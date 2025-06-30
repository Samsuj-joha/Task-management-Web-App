// src/app/api/time-entries/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/time-entries/[id] - Get single time entry
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== GET /api/time-entries/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const timeEntry = await prisma.timeEntry.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    if (!timeEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    // Check if user owns this time entry
    if (timeEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ timeEntry })

  } catch (error) {
    console.error(`Database GET Error for time entry ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/time-entries/[id] - Update time entry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== PATCH /api/time-entries/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = body.data || body

    // Check if time entry exists and user owns it
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Prepare update object
    const updateObject: any = {
      updatedAt: new Date()
    }

    if (updateData.description !== undefined) updateObject.description = updateData.description
    if (updateData.duration !== undefined) {
      const duration = parseInt(updateData.duration)
      if (duration <= 0) {
        return NextResponse.json(
          { error: 'Duration must be greater than 0' },
          { status: 400 }
        )
      }
      updateObject.duration = duration
    }
    if (updateData.startTime !== undefined) updateObject.startTime = new Date(updateData.startTime)
    if (updateData.endTime !== undefined) updateObject.endTime = new Date(updateData.endTime)
    if (updateData.date !== undefined) updateObject.date = updateData.date
    if (updateData.category !== undefined) updateObject.category = updateData.category
    if (updateData.billable !== undefined) updateObject.billable = updateData.billable
    if (updateData.taskId !== undefined) updateObject.taskId = updateData.taskId || null
    if (updateData.projectId !== undefined) updateObject.projectId = updateData.projectId || null

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id: params.id },
      data: updateObject,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Time entry updated successfully',
      timeEntry: updatedEntry
    })

  } catch (error) {
    console.error(`Database PATCH Error for time entry ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/time-entries/[id] - Delete time entry
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== DELETE /api/time-entries/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if time entry exists and user owns it
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id: params.id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete time entry
    await prisma.timeEntry.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Time entry deleted successfully'
    })

  } catch (error) {
    console.error(`Database DELETE Error for time entry ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}