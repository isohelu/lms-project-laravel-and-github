import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/session'
import { userRepository } from '@/lib/repositories/userRepository'

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  photo: z.string().url('Photo must be a valid URL').optional().nullable()
})

export async function GET() {
  try {
    const session = await requireAuth()
    const user = userRepository.findById(session.id)
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
        created_at: user.created_at
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch profile.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await req.json()
    const parsed = profileUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const updated = userRepository.update(session.id, parsed.data)
    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        photo: updated.photo
      }
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update profile.' }, { status: 500 })
  }
}
