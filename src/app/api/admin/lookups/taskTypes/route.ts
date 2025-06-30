// src/app/api/admin/lookups/taskTypes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const items = await request.json()
    
    await prisma.taskType.updateMany({
      data: { isActive: false }
    })
    
    for (const item of items) {
      if (item.isNew) {
        await prisma.taskType.create({
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0
          }
        })
      } else {
        await prisma.taskType.update({
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
    console.error('Error updating task types:', error)
    return NextResponse.json(
      { error: 'Failed to update task types' },
      { status: 500 }
    )
  }
}