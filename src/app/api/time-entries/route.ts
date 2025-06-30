// src/app/api/time-entries/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/time-entries - Get user's time entries
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/time-entries ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const filter = searchParams.get('filter') || 'all'

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    // Add search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add date filter
    const now = new Date()
    switch (filter) {
      case 'today':
        where.date = now.toISOString().split('T')[0]
        break
      case 'week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        where.date = {
          gte: startOfWeek.toISOString().split('T')[0]
        }
        break
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        where.date = {
          gte: startOfMonth.toISOString().split('T')[0]
        }
        break
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
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
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    })

    console.log(`Retrieved ${timeEntries.length} time entries`)

    return NextResponse.json({ 
      timeEntries,
      total: timeEntries.length
    })

  } catch (error) {
    console.error('Time entries GET error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// POST /api/time-entries - Create new time entry
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/time-entries ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received time entry data:', JSON.stringify(body, null, 2))

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
    if (!description || !duration || !date) {
      return NextResponse.json(
        { error: 'Description, duration, and date are required' },
        { status: 400 }
      )
    }

    if (duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      )
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log('User does not exist, creating user:', session.user.id)
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

    // Create time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        description,
        duration: parseInt(duration),
        startTime: new Date(startTime || `${date}T09:00:00`),
        endTime: new Date(endTime || `${date}T${Math.floor(parseInt(duration) / 60).toString().padStart(2, '0')}:${(parseInt(duration) % 60).toString().padStart(2, '0')}:00`),
        date,
        category: category || 'Development',
        billable: billable !== false, // Default to true
        userId: session.user.id,
        taskId: (taskId && taskId !== 'none') ? taskId : null,
        projectId: (projectId && projectId !== 'none') ? projectId : null
      },
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

    console.log('Time entry created:', timeEntry.id)

    return NextResponse.json(
      { 
        message: 'Time entry created successfully',
        entry: timeEntry
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Time entry POST error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}