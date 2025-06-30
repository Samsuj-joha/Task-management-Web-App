// src/app/api/time-entries/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

// GET /api/time-entries - Get all time entries
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/time-entries (Database) ===')
    
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
    const category = searchParams.get('category')
    const billable = searchParams.get('billable')

    // Build dynamic where clause
    const where: any = {
      userId: session.user.id
    }

    // Add search filter
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Add category filter
    if (category && category !== 'all') {
      where.category = category
    }

    // Add billable filter
    if (billable && billable !== 'all') {
      where.billable = billable === 'true'
    }

    // Add date filter (simplified for string dates)
    switch (filter) {
      case 'today':
        const today = format(new Date(), 'yyyy-MM-dd')
        where.date = today
        break
      case 'week':
        // For week/month filtering, we'll use createdAt instead
        const weekStart = startOfWeek(new Date())
        where.createdAt = {
          gte: weekStart
        }
        break
      case 'month':
        const monthStart = startOfMonth(new Date())
        where.createdAt = {
          gte: monthStart
        }
        break
    }

    // Query database for time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    })

    console.log(`Retrieved ${timeEntries.length} time entries from database`)

    return NextResponse.json({ 
      timeEntries,
      total: timeEntries.length,
      message: timeEntries.length === 0 ? 'No time entries found.' : `Found ${timeEntries.length} time entries`
    })

  } catch (error) {
    console.error('Database GET Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// POST /api/time-entries - Create new time entry
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/time-entries (Database) ===')
    
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
    if (!description || !duration || !startTime || !endTime || !date) {
      return NextResponse.json(
        { error: 'Description, duration, start time, end time, and date are required' },
        { status: 400 }
      )
    }

    // Validate duration
    if (duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be greater than 0' },
        { status: 400 }
      )
    }

    // Create new time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        description,
        duration: parseInt(duration),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        date,
        category: category || 'Development',
        billable: billable !== false,
        userId: session.user.id,
        taskId: taskId || null,
        projectId: projectId || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
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
    })

    console.log(`Time entry created in database: ${timeEntry.id}`)

    return NextResponse.json(
      { 
        message: 'Time entry created successfully', 
        timeEntry
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