// // src/app/api/notes/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'

// // Validation schemas
// const createNoteSchema = z.object({
//   title: z.string().min(1, 'Title is required').max(200),
//   content: z.string().min(1, 'Content is required'),
//   categoryId: z.string().optional(),
//   isPinned: z.boolean().default(false),
//   priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
//   tags: z.array(z.string()).default([])
// })

// // GET /api/notes - Get all notes with filtering
// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const { searchParams } = new URL(request.url)
//     const filter = searchParams.get('filter') || 'all'
//     const categoryId = searchParams.get('categoryId')
//     const search = searchParams.get('search')
//     const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
//     const limit = parseInt(searchParams.get('limit') || '50')
//     const offset = parseInt(searchParams.get('offset') || '0')

//     // Build where clause
//     const where: any = {
//       authorId: session.user.id
//     }

//     // Apply filters
//     switch (filter) {
//       case 'pinned':
//         where.isPinned = true
//         where.isArchived = false
//         break
//       case 'recent':
//         where.isArchived = false
//         break
//       case 'archived':
//         where.isArchived = true
//         break
//       case 'all':
//       default:
//         // No additional filter
//         break
//     }

//     // Category filter
//     if (categoryId) {
//       where.categoryId = categoryId
//     }

//     // Search filter
//     if (search) {
//       where.OR = [
//         { title: { contains: search, mode: 'insensitive' } },
//         { content: { contains: search, mode: 'insensitive' } },
//         { tags: { hasSome: [search] } }
//       ]
//     }

//     // Tags filter
//     if (tags.length > 0) {
//       where.tags = { hasSome: tags }
//     }

//     // Fetch notes
//     const notes = await prisma.note.findMany({
//       where,
//       include: {
//         category: true,
//         author: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       },
//       orderBy: [
//         { isPinned: 'desc' },
//         { updatedAt: 'desc' }
//       ],
//       take: limit,
//       skip: offset
//     })

//     // Get total count for pagination
//     const total = await prisma.note.count({ where })

//     return NextResponse.json({
//       notes,
//       pagination: {
//         total,
//         limit,
//         offset,
//         hasMore: offset + limit < total
//       }
//     })

//   } catch (error) {
//     console.error('GET /api/notes error:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch notes' },
//       { status: 500 }
//     )
//   }
// }

// // POST /api/notes - Create new note
// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await request.json()
//     const validatedData = createNoteSchema.parse(body)

//     // Create note
//     const note = await prisma.note.create({
//       data: {
//         ...validatedData,
//         authorId: session.user.id
//       },
//       include: {
//         category: true,
//         author: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       }
//     })

//     return NextResponse.json(note, { status: 201 })

//   } catch (error) {
//     console.error('POST /api/notes error:', error)
    
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: 'Validation failed', details: error.errors },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json(
//       { error: 'Failed to create note' },
//       { status: 500 }
//     )
//   }
// }




// src/app/api/notes/route.ts - Full Database Version
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema
const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional(),
  isPinned: z.boolean().default(false),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  tags: z.array(z.string()).default([])
})

// GET /api/notes - Fetch from database
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 GET /api/notes called')
    
    const session = await getServerSession(authOptions)
    console.log('👤 Session check:', !!session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {
      authorId: session.user.id
    }

    // Apply filters
    switch (filter) {
      case 'pinned':
        where.isPinned = true
        where.isArchived = false
        break
      case 'recent':
        where.isArchived = false
        break
      case 'archived':
        where.isArchived = true
        break
      case 'all':
      default:
        // No additional filter
        break
    }

    // Category filter
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    console.log('🔍 Query where:', where)

    // Fetch notes from database
    const notes = await prisma.note.findMany({
      where,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    console.log(`📚 Found ${notes.length} notes`)

    // Get total count
    const total = await prisma.note.count({ where })

    return NextResponse.json({
      notes,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('💥 GET /api/notes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/notes - Save to database
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/notes called')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📝 Request body:', body)

    // Validate data
    const validatedData = createNoteSchema.parse(body)
    console.log('✅ Validated data:', validatedData)

    // Prepare data for database
    const noteData = {
      title: validatedData.title,
      content: validatedData.content,
      isPinned: validatedData.isPinned,
      priority: validatedData.priority,
      tags: validatedData.tags,
      authorId: session.user.id,
      ...(validatedData.categoryId && validatedData.categoryId !== 'none' && {
        categoryId: validatedData.categoryId
      })
    }

    console.log('💾 Saving to database:', noteData)

    // Create note in database
    const note = await prisma.note.create({
      data: noteData,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('🎉 Note created with ID:', note.id)
    return NextResponse.json(note, { status: 201 })

  } catch (error) {
    console.error('💥 POST /api/notes error:', error)
    
    if (error instanceof z.ZodError) {
      console.log('❌ Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    )
  }
}