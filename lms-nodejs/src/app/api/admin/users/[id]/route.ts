import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'

const userUpdateSchema = z.object({
  role: z.enum(['student', 'instructor', 'admin']).optional(),
  status: z.number().int().min(0).max(1).optional(),
  name: z.string().min(2).optional()
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(['admin'])
    const { id } = await context.params
    const targetUserId = parseInt(id, 10)

    if (isNaN(targetUserId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = userUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    // Guard against admin accidentally banning or demoting their own active account
    if (targetUserId === admin.id && (parsed.data.status === 0 || (parsed.data.role && parsed.data.role !== 'admin'))) {
      return NextResponse.json(
        { success: false, message: 'You cannot ban or demote your own administrator account.' },
        { status: 400 }
      )
    }

    const updated = userRepository.update(targetUserId, parsed.data)
    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Update user error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update user.' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(['admin'])
    const { id } = await context.params
    const targetUserId = parseInt(id, 10)

    if (isNaN(targetUserId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID.' }, { status: 400 })
    }

    if (targetUserId === admin.id) {
      return NextResponse.json(
        { success: false, message: 'You cannot delete your own administrator account.' },
        { status: 400 }
      )
    }

    const deleted = userRepository.delete(targetUserId)

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'User deleted successfully.' : 'User not found.'
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Delete user error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete user.' }, { status: 500 })
  }
}
