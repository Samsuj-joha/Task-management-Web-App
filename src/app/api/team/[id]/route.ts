// src/app/api/team/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/team/[id] - Get single team member
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== GET /api/team/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teamMember = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        department: true,
        phone: true,
        bio: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include detailed task and project information
        assignedTasks: {
          include: {
            project: {
              select: { id: true, name: true, status: true }
            },
            tags: {
              include: { tag: true }
            }
          },
          orderBy: { updatedAt: 'desc' }
        },
        projects: {
          include: {
            _count: {
              select: { tasks: true, members: true }
            }
          },
          orderBy: { updatedAt: 'desc' }
        },
        projectMembers: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                priority: true,
                owner: {
                  select: { id: true, name: true, email: true }
                },
                _count: {
                  select: { tasks: true, members: true }
                }
              }
            }
          }
        },
        _count: {
          select: {
            assignedTasks: true,
            projects: true,
            projectMembers: true
          }
        }
      }
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Calculate detailed statistics
    const tasks = teamMember.assignedTasks
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED')
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
    )
    const urgentTasks = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED')

    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTasks = tasks.filter(t => new Date(t.updatedAt) >= thirtyDaysAgo)
    const recentCompletions = recentTasks.filter(t => t.status === 'COMPLETED')

    const enrichedMember = {
      ...teamMember,
      stats: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        inProgressTasks: inProgressTasks.length,
        overdueTasks: overdueTasks.length,
        urgentTasks: urgentTasks.length,
        completionRate,
        totalProjects: teamMember._count.projects + teamMember._count.projectMembers,
        ownedProjects: teamMember._count.projects,
        recentActivity: {
          tasksWorkedOn: recentTasks.length,
          tasksCompleted: recentCompletions.length
        }
      }
    }

    return NextResponse.json({ teamMember: enrichedMember })

  } catch (error) {
    console.error(`Database GET Error for team member ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/team/[id] - Update team member
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== PATCH /api/team/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData = body.data || body

    // Check if team member exists
    const existingMember = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Prepare update object
    const updateObject: any = { updatedAt: new Date() }

    // Safe field updates
    if (updateData.name !== undefined) updateObject.name = updateData.name
    if (updateData.role !== undefined) updateObject.role = updateData.role.toUpperCase()
    if (updateData.department !== undefined) updateObject.department = updateData.department
    if (updateData.phone !== undefined) updateObject.phone = updateData.phone
    if (updateData.bio !== undefined) updateObject.bio = updateData.bio

    // Update team member
    const updatedMember = await prisma.user.update({
      where: { id: params.id },
      data: updateObject,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        department: true,
        phone: true,
        bio: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedTasks: true,
            projects: true,
            projectMembers: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Team member updated successfully',
      teamMember: updatedMember
    })

  } catch (error) {
    console.error(`Database PATCH Error for team member ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/team/[id] - Remove team member (deactivate)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`=== DELETE /api/team/${params.id} (Database) ===`)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if team member exists
    const existingMember = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Don't allow users to delete themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 400 }
      )
    }

    // Instead of hard delete, set isActive to false
    // This preserves task/project history
    const deactivatedMember = await prisma.user.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'Team member deactivated successfully',
      teamMember: deactivatedMember
    })

  } catch (error) {
    console.error(`Database DELETE Error for team member ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}