// File 3: src/app/api/admin/users/[id]/route.ts
// Individual user management API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/admin/users/[id] - Update user (Admin only)
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    console.log(`=== PATCH /api/admin/users/${params.id} (Update User) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Check if target user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    console.log('Update data:', JSON.stringify(body, null, 2))

    // Prepare update object
    const updateData: any = {
      updatedAt: new Date()
    }

    // Map fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.role !== undefined) updateData.role = body.role.toUpperCase()
    if (body.department !== undefined) updateData.department = body.department
    if (body.employeeId !== undefined) updateData.employeeId = body.employeeId
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.location !== undefined) updateData.location = body.location
    if (body.bio !== undefined) updateData.bio = body.bio
    if (body.status !== undefined) {
      updateData.status = body.status.toUpperCase()
      updateData.isActive = body.status.toUpperCase() === 'ACTIVE'
    }

    // Update name if first/last name changed
    if (body.firstName !== undefined || body.lastName !== undefined) {
      const firstName = body.firstName || existingUser.firstName || ''
      const lastName = body.lastName || existingUser.lastName || ''
      updateData.name = `${firstName} ${lastName}`.trim() || existingUser.email.split('@')[0]
    }

    // Check employee ID uniqueness if changed
    if (body.employeeId && body.employeeId !== existingUser.employeeId) {
      const existingEmployee = await prisma.user.findUnique({
        where: { employeeId: body.employeeId }
      })

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee ID already exists' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        employeeId: true,
        phone: true,
        location: true,
        bio: true,
        status: true,
        isActive: true,
        updatedAt: true
      }
    })

    console.log(`✅ User updated: ${updatedUser.email}`)

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error(`❌ PATCH /api/admin/users/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user (Admin only)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    console.log(`=== DELETE /api/admin/users/${params.id} (Delete User) ===`)
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { email: true }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user (CASCADE will handle related records)
    await prisma.user.delete({
      where: { id: params.id }
    })

    console.log(`✅ User deleted: ${existingUser.email}`)

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error(`❌ DELETE /api/admin/users/${params.id} error:`, error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
