// src/app/api/auth/register/route.ts - UPDATE THIS FILE
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 🔑 ADMIN EMAILS - ADD YOUR EMAIL HERE
const ADMIN_EMAILS = [
  'admin@example.com',  // ⭐ YOUR ADMIN EMAIL
  'joha12@gmail.com'      // ⭐ ADD YOUR PERSONAL EMAIL TOO
]

async function determineUserRole(email: string): Promise<'ADMIN' | 'USER'> {
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    console.log(`🔑 Assigning ADMIN role to: ${email}`)
    return 'ADMIN'
  }
  
  const userCount = await prisma.user.count()
  if (userCount === 0) {
    console.log(`👑 First user - assigning ADMIN role to: ${email}`)
    return 'ADMIN'
  }
  
  console.log(`👤 Assigning USER role to: ${email}`)
  return 'USER'
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, department, employeeId } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    if (employeeId) {
      const existingEmployeeId = await prisma.user.findUnique({
        where: { employeeId }
      })

      if (existingEmployeeId) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const userRole = await determineUserRole(email)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password: hashedPassword,
        department,
        employeeId,
        role: userRole,  // Will be ADMIN or USER
        isActive: true,
        status: 'ACTIVE'
      }
    })

    console.log(`✅ User created: ${email} with role: ${userRole}`)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: userWithoutPassword,
        role: userRole
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}