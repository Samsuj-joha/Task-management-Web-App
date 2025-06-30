// src/app/api/projects/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects - Get all projects from database
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/projects (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    // Build dynamic where clause
    const where: any = {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    }

    // Add filters
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority.toUpperCase()
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Query database with Prisma
    const projects = await prisma.project.findMany({
      where,
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
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    console.log(`Retrieved ${projects.length} projects from database`)

    return NextResponse.json({ 
      projects,
      total: projects.length,
      message: projects.length === 0 ? 'No projects found. Create your first project!' : `Found ${projects.length} projects`
    })

  } catch (error) {
    console.error('Database GET Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/projects (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received project data:', JSON.stringify(body, null, 2))

    const { 
      name, 
      description,
      status,
      priority,
      startDate,
      deadline,
      budget,
      color,
      memberEmails
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'ACTIVE',
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        endDate: deadline ? new Date(deadline) : null,
        ownerId: session.user.id
      },
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
        _count: {
          select: {
            tasks: true,
            members: true
          }
        }
      }
    })

    // Add project owner as a member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        role: 'OWNER'
      }
    })

    // Handle member invitations if provided
    if (memberEmails && memberEmails.length > 0) {
      for (const email of memberEmails) {
        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (user && user.id !== session.user.id) {
            // Add as project member
            await prisma.projectMember.create({
              data: {
                projectId: project.id,
                userId: user.id,
                role: 'MEMBER'
              }
            })
          }
        } catch (memberError) {
          console.error('Error adding member:', memberError)
          // Continue with project creation even if member addition fails
        }
      }
    }

    // Fetch updated project with members
    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id },
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

    console.log(`Project created in database: ${project.id}`)

    return NextResponse.json(
      { 
        message: 'Project created successfully', 
        project: updatedProject 
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