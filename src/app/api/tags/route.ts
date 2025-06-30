// src/app/api/tags/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tags - Get all tags
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/tags (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build dynamic where clause
    const where: any = {}

    // Add search filter
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Build order by clause
    const orderBy: any = {}
    if (sortBy === 'usage') {
      // Sort by task count
      orderBy.tasks = { _count: sortOrder as 'asc' | 'desc' }
    } else {
      orderBy[sortBy] = sortOrder as 'asc' | 'desc'
    }

    // Query database for all tags
    const tags = await prisma.tag.findMany({
      where,
      include: {
        tasks: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                assignee: {
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
      },
      orderBy: sortBy === 'usage' ? { tasks: { _count: sortOrder as 'asc' | 'desc' } } : { [sortBy]: sortOrder }
    })

    // Calculate tag statistics
    const enrichedTags = tags.map(tag => {
      const taskList = tag.tasks.map(t => t.task)
      const completedTasks = taskList.filter(t => t.status === 'COMPLETED').length
      const inProgressTasks = taskList.filter(t => t.status === 'IN_PROGRESS').length
      const urgentTasks = taskList.filter(t => t.priority === 'URGENT' && t.status !== 'COMPLETED').length
      
      return {
        ...tag,
        stats: {
          totalTasks: tag._count.tasks,
          completedTasks,
          inProgressTasks,
          urgentTasks,
          completionRate: tag._count.tasks > 0 ? Math.round((completedTasks / tag._count.tasks) * 100) : 0
        },
        recentTasks: taskList
          .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
          .slice(0, 5)
      }
    })

    console.log(`Retrieved ${enrichedTags.length} tags from database`)

    return NextResponse.json({ 
      tags: enrichedTags,
      total: enrichedTags.length,
      message: enrichedTags.length === 0 ? 'No tags found.' : `Found ${enrichedTags.length} tags`
    })

  } catch (error) {
    console.error('Database GET Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create new tag
export async function POST(request: Request) {
  try {
    console.log('=== POST /api/tags (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received tag data:', JSON.stringify(body, null, 2))

    const { name, color } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      )
    }

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 400 }
      )
    }

    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#6B7280'
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })

    console.log(`Tag created in database: ${tag.id}`)

    return NextResponse.json(
      { 
        message: 'Tag created successfully', 
        tag: {
          ...tag,
          stats: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            urgentTasks: 0,
            completionRate: 0
          },
          recentTasks: []
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