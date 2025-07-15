// // src/app/api/notes/categories/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// import { prisma } from '@/lib/prisma'
// import { z } from 'zod'

// const createCategorySchema = z.object({
//   name: z.string().min(1, 'Name is required').max(50),
//   color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
//   icon: z.string().max(10).optional()
// })

// // GET /api/notes/categories
// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const categories = await prisma.noteCategory.findMany({
//       where: { isActive: true },
//       include: {
//         _count: {
//           select: {
//             notes: {
//               where: {
//                 authorId: session.user.id,
//                 isArchived: false
//               }
//             }
//           }
//         }
//       },
//       orderBy: [
//         { sortOrder: 'asc' },
//         { name: 'asc' }
//       ]
//     })

//     return NextResponse.json({ categories })

//   } catch (error) {
//     console.error('GET /api/notes/categories error:', error)
//     return NextResponse.json(
//       { error: 'Failed to fetch categories' },
//       { status: 500 }
//     )
//   }
// }

// // POST /api/notes/categories
// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     }

//     const body = await request.json()
//     const validatedData = createCategorySchema.parse(body)

//     // Check if category name already exists
//     const existingCategory = await prisma.noteCategory.findUnique({
//       where: { name: validatedData.name }
//     })

//     if (existingCategory) {
//       return NextResponse.json(
//         { error: 'Category name already exists' },
//         { status: 400 }
//       )
//     }

//     // Create category
//     const category = await prisma.noteCategory.create({
//       data: validatedData,
//       include: {
//         _count: {
//           select: { notes: true }
//         }
//       }
//     })

//     return NextResponse.json(category, { status: 201 })

//   } catch (error) {
//     console.error('POST /api/notes/categories error:', error)
    
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: 'Validation failed', details: error.errors },
//         { status: 400 }
//       )
//     }

//     return NextResponse.json(
//       { error: 'Failed to create category' },
//       { status: 500 }
//     )
//   }
// }



import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return empty categories for now
    return NextResponse.json({ categories: [] })

  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}