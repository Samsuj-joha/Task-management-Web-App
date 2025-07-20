// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim().toLowerCase()
    console.log('🔍 Searching for:', searchTerm)

    // Search across different entities
    const [tasks, projects, users, notes] = await Promise.all([
      // Search tasks
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
        },
        take: 5
      }),

      // Search projects
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
        },
        take: 5
      }),

      // Search users
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
        take: 5
      }),

      // Search notes
      prisma.note.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
          ],
          authorId: session.user.id // Only user's own notes
        },
        select: {
          id: true,
          title: true,
          content: true,
          priority: true,
        },
        take: 5
      })
    ])

    // Format results
    const results = [
      // Tasks
      ...tasks.map(task => ({
        id: task.id,
        title: task.title,
        type: 'task' as const,
        description: task.description || `${task.status} - ${task.priority} priority`,
        status: task.status,
        url: `/dashboard/tasks/${task.id}`
      })),

      // Projects
      ...projects.map(project => ({
        id: project.id,
        title: project.name,
        type: 'project' as const,
        description: project.description || `Project - ${project.status}`,
        status: project.status,
        url: `/dashboard/projects/${project.id}`
      })),

      // Users
      ...users.map(user => ({
        id: user.id,
        title: user.name || `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
        type: 'user' as const,
        description: `${user.email} - ${user.role}`,
        url: `/dashboard/team/${user.id}`
      })),

      // Notes
      ...notes.map(note => ({
        id: note.id,
        title: note.title,
        type: 'note' as const,
        description: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
        url: `/dashboard/notes/${note.id}`
      }))
    ]

    console.log(`✅ Found ${results.length} search results`)

    return NextResponse.json({
      results: results.slice(0, 20), // Limit to 20 results
      query: searchTerm,
      totalCount: results.length
    })

  } catch (error) {
    console.error('❌ Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    )
  }
}