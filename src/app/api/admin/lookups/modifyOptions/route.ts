// src/app/api/admin/lookups/modifyOptions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const items = await request.json()
    
    await prisma.modifyOption.updateMany({
      data: { isActive: false }
    })
    
    for (const item of items) {
      if (item.isNew) {
        await prisma.modifyOption.create({
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0
          }
        })
      } else {
        await prisma.modifyOption.update({
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
    console.error('Error updating modify options:', error)
    return NextResponse.json(
      { error: 'Failed to update modify options' },
      { status: 500 }
    )
  }
}