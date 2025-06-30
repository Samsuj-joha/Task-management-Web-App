// src/app/api/profile/route.ts (FIXED VERSION)
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profile - Get user profile
export async function GET(request: Request) {
  try {
    console.log('=== GET /api/profile (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find user profile
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        department: true,
        phone: true,
        location: true,
        bio: true,
        skills: true,
        status: true,
        isActive: true,
        joinedAt: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      // Create user if doesn't exist
      console.log('Profile user does not exist, creating:', session.user.id)
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || 'unknown@email.com',
          name: session.user.name || session.user.email || 'Unknown User',
          image: session.user.image || null, // Include image from session
          isActive: true,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          joinedAt: new Date(),
          lastActive: new Date()
        },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          role: true,
          department: true,
          phone: true,
          location: true,
          bio: true,
          skills: true,
          status: true,
          isActive: true,
          joinedAt: true,
          lastActive: true,
          createdAt: true,
          updatedAt: true
        }
      })
      console.log('Created missing profile user:', user.id)
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Profile GET Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Update user profile (FIXED VERSION)
export async function PATCH(request: Request) {
  try {
    console.log('=== PATCH /api/profile (Database) ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received profile data:', JSON.stringify(body, null, 2))

    // Ensure user exists before updating
    let existingUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!existingUser) {
      // Create user if doesn't exist
      console.log('Profile user does not exist, creating before update:', session.user.id)
      existingUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || 'unknown@email.com',
          name: session.user.name || session.user.email || 'Unknown User',
          image: session.user.image || null,
          isActive: true,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          joinedAt: new Date(),
          lastActive: new Date()
        }
      })
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date(),
      lastActive: new Date()
    }

    // Update fields if provided - INCLUDING IMAGE!
    if (body.name !== undefined) updateData.name = body.name
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.image !== undefined) updateData.image = body.image // THIS WAS MISSING!
    if (body.department !== undefined) updateData.department = body.department
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.location !== undefined) updateData.location = body.location
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.skills !== undefined) updateData.skills = Array.isArray(body.skills) ? body.skills : []

    console.log('Update data prepared:', JSON.stringify(updateData, null, 2))

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true, // Make sure to select image in response
        role: true,
        department: true,
        phone: true,
        location: true,
        bio: true,
        skills: true,
        status: true,
        isActive: true,
        joinedAt: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log(`Profile updated for user: ${updatedUser.id}`)
    console.log('Updated user data:', JSON.stringify(updatedUser, null, 2))

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile PATCH Error:', error)
    return NextResponse.json(
      { error: 'Database error: ' + error.message },
      { status: 500 }
    )
  }
}