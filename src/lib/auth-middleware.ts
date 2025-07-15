// lib/auth-middleware.ts - CREATE THIS FILE
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/permissions'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  name?: string
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      isActive: true
    }
  })

  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 })
  }

  return { user: user as AuthenticatedUser }
}

export async function withAuth<T>(
  handler: (user: AuthenticatedUser) => Promise<T>
): Promise<T | NextResponse> {
  try {
    const authResult = await requireAuth()
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    return await handler(authResult.user)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}