// src/app/api/tasks/test/route.ts
// Create this minimal test route to isolate the issue
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log('🔍 Starting minimal tasks test...')
  
  try {
    // Step 1: Check session
    console.log('Step 1: Checking session...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ 
        error: 'No session', 
        step: 'session_check',
        details: 'User must be logged in'
      }, { status: 401 })
    }
    
    console.log('✅ Session found:', session.user.email)

    // Step 2: Test database connection
    console.log('Step 2: Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected')

    // Step 3: Test simple query
    console.log('Step 3: Testing simple query...')
    const userCount = await prisma.user.count()
    console.log(`✅ Users table accessible, count: ${userCount}`)

    // Step 4: Test tasks table
    console.log('Step 4: Testing tasks table...')
    const taskCount = await prisma.task.count()
    console.log(`✅ Tasks table accessible, count: ${taskCount}`)

    // Step 5: Test user lookup
    console.log('Step 5: Testing user lookup...')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ 
        error: 'User not found in database', 
        step: 'user_lookup',
        sessionUserId: session.user.id
      }, { status: 404 })
    }
    
    console.log('✅ User found:', user.email)

    // Step 6: Test simple task query
    console.log('Step 6: Testing simple task query...')
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id }
        ]
      },
      take: 1,
      select: {
        id: true,
        name: true,
        title: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log(`✅ Simple task query successful, found ${tasks.length} tasks`)

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      data: {
        userEmail: user.email,
        userTaskCount: tasks.length,
        totalTasks: taskCount,
        totalUsers: userCount
      }
    })

  } catch (error) {
    console.error('❌ Test failed at some step:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack
      timestamp: new Date().toISOString()
    }, { status: 500 })
    
  } finally {
    try {
      await prisma.$disconnect()
      console.log('✅ Database disconnected')
    } catch (error) {
      console.error('❌ Error disconnecting:', error)
    }
  }
}