// src/app/api/lookups/all/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [modules, departments, taskTypes, subTasks, modifyOptions, references] = await Promise.all([
      prisma.module.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true }
      }),
      prisma.department.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true }
      }),
      prisma.taskType.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true }
      }),
      prisma.subTask.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, taskTypeId: true }
      }),
      prisma.modifyOption.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true }
      }),
      prisma.reference.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true }
      })
    ])
    
    return NextResponse.json({
      modules,
      departments,
      taskTypes,
      subTasks,
      modifyOptions,
      references
    })
  } catch (error) {
    console.error('Error fetching lookup data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lookup data' },
      { status: 500 }
    )
  }
}