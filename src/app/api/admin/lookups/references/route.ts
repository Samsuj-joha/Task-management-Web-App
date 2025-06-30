// src/app/api/admin/lookups/references/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const items = await request.json()
    
    await prisma.reference.updateMany({
      data: { isActive: false }
    })
    
    for (const item of items) {
      if (item.isNew) {
        await prisma.reference.create({
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0
          }
        })
      } else {
        await prisma.reference.update({
          where: { id: item.id },
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0
          }
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating references:', error)
    return NextResponse.json(
      { error: 'Failed to update references' },
      { status: 500 }
    )
  }
}