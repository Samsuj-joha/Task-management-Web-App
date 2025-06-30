// src/app/api/tags/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tags/[id] - Get single tag
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== GET /api/tags/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          include: {
            task: {
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                },
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true
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
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Calculate detailed statistics
    const taskList = tag.tasks.map(t => t.task)
    const completedTasks = taskList.filter(t => t.status === 'COMPLETED')
    const inProgressTasks = taskList.filter(t => t.status === 'IN_PROGRESS')
    const todoTasks = taskList.filter(t => t.status === 'TODO')
    const urgentTasks = taskList.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED')
    const overdueTasks = taskList.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
    )

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTasks = taskList.filter(t => 
      new Date(t.updatedAt) >= thirtyDaysAgo
    )

    const enrichedTag = {
      ...tag,
      stats: {
        totalTasks: tag._count.tasks,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        todoTasks: todoTasks.length,
        urgentTasks: urgentTasks.length,
        overdueTasks: overdueTasks.length,
        completionRate: tag._count.tasks > 0 ? Math.round((completedTasks.length / tag._count.tasks) * 100) : 0,
        recentActivity: recentTasks.length
      },
      tasksByStatus: {
        TODO: todoTasks,
        IN_PROGRESS: inProgressTasks,
        COMPLETED: completedTasks
      },
      recentTasks: taskList
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
    }

    return NextResponse.json({ tag: enrichedTag })

  } catch (error) {
    console.error(`Database GET Error for tag ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/tags/[id] - Update tag
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== PATCH /api/tags/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = body.data || body

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== existingTag.name) {
      const nameConflict = await prisma.tag.findUnique({
        where: { name: updateData.name.trim() }
      })

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Tag with this name already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update object
    const updateObject: any = {}

    if (updateData.name !== undefined) updateObject.name = updateData.name.trim()
    if (updateData.color !== undefined) updateObject.color = updateData.color

    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id: params.id },
      data: updateObject,
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Tag updated successfully',
      tag: updatedTag
    })

  } catch (error) {
    console.error(`Database PATCH Error for tag ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/tags/[id] - Delete tag
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== DELETE /api/tags/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      )
    }

    // Check if tag is being used
    if (existingTag._count.tasks > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete tag "${existingTag.name}" because it is used by ${existingTag._count.tasks} task(s). Remove the tag from all tasks first.` 
        },
        { status: 400 }
      )
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Tag deleted successfully'
    })

  } catch (error) {
    console.error(`Database DELETE Error for tag ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}