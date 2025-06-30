// src/app/api/team/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/team - Get all team members
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/team (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const department = searchParams.get('department')

    // Build dynamic where clause
    const where: any = {}

    // Add filters
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (role && role !== 'all') {
      where.role = role.toUpperCase()
    }

    if (department && department !== 'all') {
      where.department = { contains: department, mode: 'insensitive' }
    }

    // Query database for all users (team members)
    const teamMembers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        status: true,
        phone: true,
        location: true,
        bio: true,
        skills: true,
        joinedAt: true,
        lastActive: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include task and project statistics
        assignedTasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            completedAt: true,
            dueDate: true
          }
        },
        projects: {
          select: {
            id: true,
            status: true,
            name: true
          }
        },
        projectMembers: {
          select: {
            role: true,
            project: {
              select: {
                id: true,
                name: true,
                status: true
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
      },
      orderBy: [
        { status: 'asc' }, // Active users first
        { name: 'asc' }
      ]
    })

    // Calculate statistics for each team member
    const enrichedMembers = teamMembers.map(member => {
      const tasks = member.assignedTasks
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED')
      const overdueTasks = tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
      )
      const urgentTasks = tasks.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED')
      
      const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
      
      return {
        ...member,
        displayName: member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        stats: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          overdueTasks: overdueTasks.length,
          urgentTasks: urgentTasks.length,
          completionRate,
          totalProjects: member._count.projects + member._count.projectMembers,
          ownedProjects: member._count.projects
        }
      }
    })

    console.log(`Retrieved ${enrichedMembers.length} team members from database`)

    return NextResponse.json({ 
      teamMembers: enrichedMembers,
      total: enrichedMembers.length,
      message: enrichedMembers.length === 0 ? 'No team members found.' : `Found ${enrichedMembers.length} team members`
    })

  } catch (error) {
    console.error('Database GET Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// POST /api/team - Invite new team member
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/team (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received team member data:', JSON.stringify(body, null, 2))

    const { 
      name,
      firstName,
      lastName,
      email, 
      role,
      department,
      phone,
      location,
      bio,
      skills
    } = body

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new team member (user)
    const teamMember = await prisma.user.create({
      data: {
        name: name || `${firstName || ''} ${lastName || ''}`.trim(),
        firstName,
        lastName,
        email,
        role: role ? role.toUpperCase() : 'EMPLOYEE',
        department: department || 'General',
        phone,
        location,
        bio,
        skills: skills || [],
        status: 'ACTIVE',
        isActive: true,
        joinedAt: new Date(),
        lastActive: new Date()
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        department: true,
        status: true,
        phone: true,
        location: true,
        bio: true,
        skills: true,
        joinedAt: true,
        lastActive: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: true,
            projects: true,
            projectMembers: true
          }
        }
      }
    })

    console.log(`Team member created in database: ${teamMember.id}`)

    return NextResponse.json(
      { 
        message: 'Team member invited successfully', 
        teamMember: {
          ...teamMember,
          displayName: teamMember.name || `${teamMember.firstName || ''} ${teamMember.lastName || ''}`.trim(),
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            overdueTasks: 0,
            urgentTasks: 0,
            completionRate: 0,
            totalProjects: 0,
            ownedProjects: 0
          }
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Database POST Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}