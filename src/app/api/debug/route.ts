// src/app/api/debug/route.ts
// Create this file to test your current setup
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    tests: {}
  }

  try {
    // Test 1: Environment variables
    debugInfo.tests.environmentVariables = {
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      DATABASE_URL_format: process.env.DATABASE_URL?.startsWith('postgresql://') || false,
      NEXTAUTH_SECRET_exists: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL_exists: !!process.env.NEXTAUTH_URL
    }

    // Test 2: Prisma connection
    try {
      await prisma.$connect()
      debugInfo.tests.prismaConnection = { status: 'success' }
    } catch (error) {
      debugInfo.tests.prismaConnection = { 
        status: 'failed', 
        error: error.message,
        code: error.code 
      }
    }

    // Test 3: Database query test
    try {
      await prisma.$queryRaw`SELECT 1 as test`
      debugInfo.tests.databaseQuery = { status: 'success' }
    } catch (error) {
      debugInfo.tests.databaseQuery = { 
        status: 'failed', 
        error: error.message,
        code: error.code 
      }
    }

    // Test 4: Table existence
    try {
      const userCount = await prisma.user.count()
      const taskCount = await prisma.task.count()
      const projectCount = await prisma.project.count()
      
      debugInfo.tests.tables = {
        status: 'success',
        counts: {
          users: userCount,
          tasks: taskCount,
          projects: projectCount
        }
      }
    } catch (error) {
      debugInfo.tests.tables = { 
        status: 'failed', 
        error: error.message,
        code: error.code 
      }
    }

    // Test 5: NextAuth session
    try {
      const session = await getServerSession(authOptions)
      debugInfo.tests.nextAuth = {
        status: 'success',
        hasSession: !!session,
        hasUserId: !!session?.user?.id,
        userEmail: session?.user?.email || 'none'
      }
    } catch (error) {
      debugInfo.tests.nextAuth = { 
        status: 'failed', 
        error: error.message 
      }
    }

    // Test 6: User lookup if session exists
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id }
        })
        debugInfo.tests.userLookup = {
          status: 'success',
          userExists: !!user,
          userName: user?.name || 'none'
        }
      } else {
        debugInfo.tests.userLookup = {
          status: 'skipped',
          reason: 'No session or user ID'
        }
      }
    } catch (error) {
      debugInfo.tests.userLookup = { 
        status: 'failed', 
        error: error.message 
      }
    }

    return NextResponse.json(debugInfo)

  } catch (error) {
    return NextResponse.json({
      ...debugInfo,
      globalError: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    }, { status: 500 })
  } finally {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  }
}