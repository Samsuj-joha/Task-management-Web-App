// src/app/api/tasks/route.ts - REPLACE ENTIRE FILE
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/auth-middleware'
import { getTasksQuery, permissions } from '@/lib/permissions'

// GET /api/tasks - Get tasks based on user role
export async function GET(request: Request) {
  return withAuth(async (user) => {
    try {
      console.log(`🔍 Fetching tasks for user ${user.email} (${user.role})`)
      
      // Get appropriate tasks based on user role
      const whereClause = getTasksQuery(user)
      console.log(`📋 Where clause for ${user.role}:`, JSON.stringify(whereClause, null, 2))
      
      // Build additional filters from query params
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')
      const priority = searchParams.get('priority')
      const assigneeId = searchParams.get('assigneeId')
      const projectId = searchParams.get('projectId')
      const search = searchParams.get('search')

      // Combine role-based filtering with additional filters
      const combinedWhere: any = { ...whereClause }

      if (status && status !== 'all') combinedWhere.status = status.toUpperCase()
      if (priority && priority !== 'all') combinedWhere.priority = priority.toUpperCase()
      if (assigneeId && assigneeId !== 'all') combinedWhere.assigneeId = assigneeId
      if (projectId && projectId !== 'all') combinedWhere.projectId = projectId

      if (search) {
        combinedWhere.OR = [
          ...(combinedWhere.OR || []),
          { title: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { comments: { contains: search, mode: 'insensitive' } }
        ]
      }

      const tasks = await prisma.task.findMany({
        where: combinedWhere,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              firstName: true,
              lastName: true
            }
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              firstName: true,
              lastName: true
            }
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          module: {
            select: {
              id: true,
              name: true
            }
          },
          devDept: {
            select: {
              id: true,
              name: true
            }
          },
          taskType: {
            select: {
              id: true,
              name: true
            }
          },
          subTask: {
            select: {
              id: true,
              name: true
            }
          },
          modify: {
            select: {
              id: true,
              name: true
            }
          },
          reference: {
            select: {
              id: true,
              name: true
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
      })

      console.log(`✅ Found ${tasks.length} tasks for ${user.role} user ${user.email}`)
      console.log(`📊 Task breakdown:`)
      tasks.forEach(task => {
        console.log(`  - ${task.title || task.name} (Creator: ${task.creator?.email})`)
      })

      return NextResponse.json({
        tasks,
        total: tasks.length,
        userRole: user.role,
        canViewAll: permissions.canViewAllTasks(user),
        message: user.role === 'ADMIN' ? 'Showing all tasks' : 'Showing your tasks only'
      })

    } catch (error) {
      console.error('❌ GET /api/tasks error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }
  })
}

// POST /api/tasks - Create new task
export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      console.log(`📝 Creating task for user ${user.email} (${user.role})`)
      
      const body = await request.json()
      console.log('Task data:', JSON.stringify(body, null, 2))

      const { 
        title,
        name,
        description,
        date,
        moduleId,
        devDeptId,
        taskTypeId,
        subTaskId,
        modifyId,
        referenceId,
        trackingNo,
        solveDate,
        sentBy,
        comments,
        status = 'TODO',
        priority = 'MEDIUM',
        dueDate,
        assigneeId,
        projectId
      } = body

      // Validate required fields
      if (!title && !name) {
        return NextResponse.json(
          { error: 'Task title or name is required' },
          { status: 400 }
        )
      }

      // Create task
      const task = await prisma.task.create({
        data: {
          title: title || name,
          name: name || title,
          description: description || comments || null,
          date: date ? new Date(date) : null,
          
          // Foreign key relations
          moduleId: moduleId || null,
          devDeptId: devDeptId || null,
          taskTypeId: taskTypeId || null,
          subTaskId: subTaskId || null,
          modifyId: modifyId || null,
          referenceId: referenceId || null,
          
          trackingNo: trackingNo || `TF-${Date.now()}`,
          solveDate: solveDate ? new Date(solveDate) : null,
          sentBy: sentBy || null,
          comments: comments || description || null,
          status,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          
          // Set creator to current user
          creatorId: user.id,
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
          }
        }
      })

      console.log(`✅ Task created by ${user.email}: ${task.id}`)

      return NextResponse.json({
        message: 'Task created successfully',
        task
      }, { status: 201 })

    } catch (error) {
      console.error('❌ POST /api/tasks error:', error)
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      )
    }
  })
}