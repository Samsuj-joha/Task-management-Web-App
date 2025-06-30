// src/app/api/admin/lookups/modules/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const items = await request.json()
    
    // First, deactivate all existing items
    await prisma.module.updateMany({
      data: { isActive: false }
    })
    
    // Then create/update the provided items
    for (const item of items) {
      if (item.isNew) {
        // Create new item
        await prisma.module.create({
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0
          }
        })
      } else {
        // Update existing item
        await prisma.module.update({
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
    console.error('Error updating modules:', error)
    return NextResponse.json(
      { error: 'Failed to update modules' },
      { status: 500 }
    )
  }
}