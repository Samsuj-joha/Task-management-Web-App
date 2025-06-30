


// src/app/api/tasks/[id]/route.ts
// Real database operations for individual tasks
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tasks/[id] - Get single task from database
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== GET /api/tasks/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        },
        taskComments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!task) {
      console.log(`Task ${params.id} not found in database`)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this task
    if (task.creatorId !== session.user.id && task.assigneeId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Transform for frontend compatibility
    const transformedTask = {
      ...task,
      name: task.name || task.title,
      title: task.name || task.title,
      comments: task.comments || task.description,
      description: task.comments || task.description,
      _count: {
        comments: task.taskComments.length
      }
    }

    console.log(`Found task in database: ${task.name || task.title}`)
    return NextResponse.json({ task: transformedTask })

  } catch (error) {
    console.error(`Database GET Error for task ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id] - Update single task in database
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== PUT /api/tasks/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Database update data:', JSON.stringify(body, null, 2))

    // Check if task exists and user has access
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      console.log(`Task ${params.id} not found for update`)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    if (existingTask.creatorId !== session.user.id && existingTask.assigneeId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Extract update data
    const updateData = body.data || body
    console.log('Extracted update data:', JSON.stringify(updateData, null, 2))

    // Prepare update object for database
    const updateObject: any = {
      updatedAt: new Date()
    }

    // Map frontend fields to database fields
    if (updateData.name !== undefined) {
      updateObject.name = updateData.name
      updateObject.title = updateData.name // Keep both for compatibility
    }
    if (updateData.date !== undefined) updateObject.date = updateData.date ? new Date(updateData.date) : null
    if (updateData.module !== undefined) updateObject.module = updateData.module
    if (updateData.devDept !== undefined) updateObject.devDept = updateData.devDept
    if (updateData.taskType !== undefined) updateObject.taskType = updateData.taskType
    if (updateData.subTask !== undefined) updateObject.subTask = updateData.subTask
    if (updateData.modify !== undefined) updateObject.modify = updateData.modify
    if (updateData.reference !== undefined) updateObject.reference = updateData.reference
    if (updateData.trackingNo !== undefined) updateObject.trackingNo = updateData.trackingNo
    if (updateData.status !== undefined) updateObject.status = updateData.status
    if (updateData.solveDate !== undefined) updateObject.solveDate = updateData.solveDate ? new Date(updateData.solveDate) : null
    if (updateData.sentBy !== undefined) updateObject.sentBy = updateData.sentBy
    if (updateData.comments !== undefined) {
      updateObject.comments = updateData.comments
      updateObject.description = updateData.comments // Keep both for compatibility
    }
    if (updateData.priority !== undefined) updateObject.priority = updateData.priority
    if (updateData.dueDate !== undefined) updateObject.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null
    if (updateData.assigneeId !== undefined) updateObject.assigneeId = updateData.assigneeId
    if (updateData.projectId !== undefined) updateObject.projectId = updateData.projectId

    // Handle completion timestamp
    if (updateData.status === 'COMPLETED' && !existingTask.completedAt) {
      updateObject.completedAt = new Date()
    } else if (updateData.status !== 'COMPLETED' && existingTask.completedAt) {
      updateObject.completedAt = null
    }

    console.log('Database update object:', JSON.stringify(updateObject, null, 2))

    // Update task in database
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateObject,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Transform for frontend compatibility
    const transformedTask = {
      ...updatedTask,
      name: updatedTask.name || updatedTask.title,
      title: updatedTask.name || updatedTask.title,
      comments: updatedTask.comments || updatedTask.description,
      description: updatedTask.comments || updatedTask.description
    }

    console.log(`Task ${params.id} updated in database successfully`)
    console.log(`Status changed from ${existingTask.status} to ${updatedTask.status}`)

    return NextResponse.json({
      message: 'Task updated in database successfully',
      task: transformedTask
    })

  } catch (error) {
    console.error(`Database PUT Error for task ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - Delete single task from database
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== DELETE /api/tasks/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if task exists and user has access
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id }
    })

    if (!existingTask) {
      console.log(`Task ${params.id} not found for deletion`)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Only creator can delete task
    if (existingTask.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only task creator can delete this task' },
        { status: 403 }
      )
    }

    // Delete task from database (CASCADE will handle related records)
    await prisma.task.delete({
      where: { id: params.id }
    })

    console.log(`Task ${params.id} deleted from database successfully`)

    return NextResponse.json({
      message: 'Task deleted from database successfully'
    })

  } catch (error) {
    console.error(`Database DELETE Error for task ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}