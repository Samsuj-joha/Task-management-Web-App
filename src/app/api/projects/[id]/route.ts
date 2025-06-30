// src/app/api/projects/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id] - Get single project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== GET /api/projects/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            tags: {
              include: {
                tag: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this project
    const hasAccess = project.ownerId === session.user.id || 
                     project.members.some(member => member.userId === session.user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error(`Database GET Error for project ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== PATCH /api/projects/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updateData = body.data || body

    // Check if project exists and user has access
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        members: true
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user can edit (owner or manager)
    const canEdit = existingProject.ownerId === session.user.id ||
                   existingProject.members.some(m => 
                     m.userId === session.user.id && 
                     (m.role === 'OWNER' || m.role === 'MANAGER')
                   )

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Prepare update object
    const updateObject: any = {
      updatedAt: new Date()
    }

    if (updateData.name !== undefined) updateObject.name = updateData.name
    if (updateData.description !== undefined) updateObject.description = updateData.description
    if (updateData.status !== undefined) updateObject.status = updateData.status
    if (updateData.priority !== undefined) updateObject.priority = updateData.priority
    if (updateData.startDate !== undefined) updateObject.startDate = updateData.startDate ? new Date(updateData.startDate) : null
    if (updateData.deadline !== undefined) updateObject.endDate = updateData.deadline ? new Date(updateData.deadline) : null

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: updateObject,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            completedAt: true
          }
        },
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updatedProject
    })

  } catch (error) {
    console.error(`Database PATCH Error for project ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== DELETE /api/projects/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if project exists and user is owner
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Only owner can delete project
    if (existingProject.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only project owner can delete this project' },
        { status: 403 }
      )
    }

    // Delete project (CASCADE will handle related records)
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error(`Database DELETE Error for project ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}