// src/app/api/tasks/route.ts (FIXED VERSION)
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/tasks - Create new task (FIXED)
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/tasks (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received task data for database:', JSON.stringify(body, null, 2))

    const { 
      name,
      date,
      module,
      devDept,
      taskType,
      subTask,
      modify,
      reference,
      trackingNo,
      solveDate,
      sentBy,
      comments,
      status,
      priority,
      dueDate,
      assigneeId,
      projectId
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      )
    }

    // CRITICAL FIX: Ensure user exists before creating task
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log('User does not exist, creating user:', session.user.id)
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || 'unknown@email.com',
          name: session.user.name || session.user.email || 'Unknown User',
          isActive: true,
          role: 'EMPLOYEE',
          status: 'ACTIVE'
        }
      })
      console.log('Created missing user:', user.id)
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId }
      })
      if (!assignee) {
        return NextResponse.json(
          { error: 'Assigned user does not exist' },
          { status: 400 }
        )
      }
    }

    // Verify project exists if provided
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })
      if (!project) {
        return NextResponse.json(
          { error: 'Project does not exist' },
          { status: 400 }
        )
      }
    }

    // Generate tracking number if not provided
    const finalTrackingNo = trackingNo || `TF-${Date.now()}`

    // Create task in database using Prisma
    const task = await prisma.task.create({
      data: {
        // Map new fields to database columns
        name,
        title: name, // For backward compatibility
        date: date ? new Date(date) : null,
        module,
        devDept,
        taskType,
        subTask,
        modify,
        reference,
        trackingNo: finalTrackingNo,
        solveDate: solveDate ? new Date(solveDate) : null,
        sentBy,
        comments,
        description: comments, // For backward compatibility
        
        // Existing fields
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        
        // Relations
        creatorId: session.user.id, // This should now work
        assigneeId: assigneeId || null,
        projectId: projectId || null
      },
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

    console.log(`Task created in database: ${task.id}`)

    return NextResponse.json(
      { 
        message: 'Task created successfully', 
        task 
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

// GET /api/tasks - Get all tasks (EXISTING - keep as is)
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/tasks (Database) ===')
    
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
    const assigneeId = searchParams.get('assigneeId')
    const projectId = searchParams.get('projectId')
    const search = searchParams.get('search')
    const module = searchParams.get('module')

    // Build dynamic where clause
    const where: any = {}

    // Add filters
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority.toUpperCase()
    }

    if (assigneeId && assigneeId !== 'all') {
      where.assigneeId = assigneeId
    }

    if (projectId && projectId !== 'all') {
      where.projectId = projectId
    }

    if (module && module !== 'all') {
      where.module = module
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { comments: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Query database with Prisma
    const tasks = await prisma.task.findMany({
      where,
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
      },
      orderBy: [
        { priority: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    console.log(`Retrieved ${tasks.length} tasks from database`)

    return NextResponse.json({ 
      tasks,
      total: tasks.length,
      message: tasks.length === 0 ? 'No tasks found. Create your first task!' : `Found ${tasks.length} tasks`
    })

  } catch (error) {
    console.error('Database GET Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}