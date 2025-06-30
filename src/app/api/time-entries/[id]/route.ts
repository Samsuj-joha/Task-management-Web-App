// src/app/api/time-entries/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/time-entries/[id] - Update time entry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== PATCH /api/time-entries/[id] ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    console.log('Updating time entry:', id, body)

    // Check if time entry exists and belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    const {
      description,
      duration,
      startTime,
      endTime,
      date,
      category,
      billable,
      taskId,
      projectId
    } = body

    // Validate required fields
    if (description !== undefined && !description.trim()) {
      return NextResponse.json(
        { error: 'Description cannot be empty' },
        { status: 400 }
      )
    }

    if (duration !== undefined && duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify task exists if provided
    if (taskId && taskId !== 'none') {
      const task = await prisma.task.findUnique({
        where: { id: taskId }
      })
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 400 }
        )
      }
    }

    // Verify project exists if provided
    if (projectId && projectId !== 'none') {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (description !== undefined) updateData.description = description
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (startTime !== undefined) updateData.startTime = new Date(startTime)
    if (endTime !== undefined) updateData.endTime = new Date(endTime)
    if (date !== undefined) updateData.date = date
    if (category !== undefined) updateData.category = category
    if (billable !== undefined) updateData.billable = billable
    if (taskId !== undefined) updateData.taskId = (taskId && taskId !== 'none') ? taskId : null
    if (projectId !== undefined) updateData.projectId = (projectId && projectId !== 'none') ? projectId : null

    // Update time entry
    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        task: {
          select: {
            id: true,
            name: true,
            title: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log('Time entry updated:', updatedEntry.id)

    return NextResponse.json({
      message: 'Time entry updated successfully',
      entry: updatedEntry
    })

  } catch (error) {
    console.error('Time entry PATCH error:', error)
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
    console.log('=== DELETE /api/time-entries/[id] ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if time entry exists and belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      )
    }

    // Delete time entry
    await prisma.timeEntry.delete({
      where: { id }
    })

    console.log('Time entry deleted:', id)

    return NextResponse.json({
      message: 'Time entry deleted successfully'
    })

  } catch (error) {
    console.error('Time entry DELETE error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}