// src/app/api/admin/lookups/subTasks/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const items = await request.json()
    
    await prisma.subTask.updateMany({
      data: { isActive: false }
    })
    
    for (const item of items) {
      if (item.isNew) {
        await prisma.subTask.create({
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0,
            taskTypeId: item.taskTypeId || null
          }
        })
      } else {
        await prisma.subTask.update({
          where: { id: item.id },
          data: {
            name: item.name,
            isActive: item.isActive ?? true,
            sortOrder: item.sortOrder || 0,
            taskTypeId: item.taskTypeId || null
          }
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating sub tasks:', error)
    return NextResponse.json(
      { error: 'Failed to update sub tasks' },
      { status: 500 }
    )
  }
}