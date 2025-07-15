// src/app/api/tasks/[id]/route.ts - REPLACE ENTIRE FILE
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'
import { permissions } from '@/lib/permissions'

// GET /api/tasks/[id] - Get single task
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      const task = await prisma.task.findUnique({
        where: { id: params.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
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

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }

      // Check if user can view this task
      if (!permissions.canEditTask(user, task)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      return NextResponse.json({ task })

    } catch (error) {
      console.error(`GET /api/tasks/${params.id} error:`, error)
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: 500 }
      )
    }
  })
}

// PUT/PATCH /api/tasks/[id] - Update task
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      // First, get the existing task
      const existingTask = await prisma.task.findUnique({
        where: { id: params.id }
      })

      if (!existingTask) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }

      // ⭐ NEW: Check permissions using role-based system
      if (!permissions.canEditTask(user, existingTask)) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this task' },
          { status: 403 }
        )
      }

      const body = await request.json()
      
      // Build update object
      const updateObject: any = {}
      
      // Handle all possible update fields
      if (body.title !== undefined) updateObject.title = body.title
      if (body.name !== undefined) {
        updateObject.name = body.name
        updateObject.title = body.name // Keep both for compatibility
      }
      if (body.description !== undefined) updateObject.description = body.description
      if (body.status !== undefined) updateObject.status = body.status
      if (body.priority !== undefined) updateObject.priority = body.priority
      if (body.dueDate !== undefined) updateObject.dueDate = body.dueDate ? new Date(body.dueDate) : null
      if (body.assigneeId !== undefined) updateObject.assigneeId = body.assigneeId
      if (body.projectId !== undefined) updateObject.projectId = body.projectId
      if (body.comments !== undefined) {
        updateObject.comments = body.comments
        updateObject.description = body.comments // Keep both for compatibility
      }

      // Handle completion timestamp
      if (body.status === 'COMPLETED' && !existingTask.completedAt) {
        updateObject.completedAt = new Date()
      } else if (body.status !== 'COMPLETED' && existingTask.completedAt) {
        updateObject.completedAt = null
      }

      // Update task
      const updatedTask = await prisma.task.update({
        where: { id: params.id },
        data: updateObject,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
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

      console.log(`Task ${params.id} updated by ${user.email} (${user.role})`)

      return NextResponse.json({
        message: 'Task updated successfully',
        task: updatedTask
      })

    } catch (error) {
      console.error(`PUT /api/tasks/${params.id} error:`, error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      )
    }
  })
}

// PATCH - Same as PUT for compatibility
export const PATCH = PUT

// DELETE /api/tasks/[id] - Delete task with role-based permissions
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withAuth(async (user) => {
    try {
      console.log(`=== DELETE /api/tasks/${params.id} by ${user.email} (${user.role}) ===`)

      // First, get the existing task
      const existingTask = await prisma.task.findUnique({
        where: { id: params.id },
        include: {
          creator: {
            select: { name: true, email: true }
          }
        }
      })

      if (!existingTask) {
        console.log(`Task ${params.id} not found`)
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }

      // ⭐ NEW: Check permissions using role-based system
      if (!permissions.canDeleteTask(user, existingTask)) {
        console.log(`User ${user.email} (${user.role}) cannot delete task ${params.id} created by ${existingTask.creator?.email}`)
        return NextResponse.json(
          { error: 'You do not have permission to delete this task' },
          { status: 403 }
        )
      }

      // Delete task (CASCADE will handle related records)
      await prisma.task.delete({
        where: { id: params.id }
      })

      console.log(`✅ Task ${params.id} deleted successfully by ${user.email} (${user.role})`)

      return NextResponse.json({
        message: 'Task deleted successfully'
      })

    } catch (error) {
      console.error(`DELETE /api/tasks/${params.id} error:`, error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }
  })
}