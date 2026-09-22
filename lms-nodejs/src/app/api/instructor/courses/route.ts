import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const courseCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category_id: z.number().int().positive().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  pricing_type: z.enum(['free', 'paid']).default('free'),
  price: z.number().min(0).default(0),
  discount: z.number().default(0),
  discount_price: z.number().nullable().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().url().optional()
})

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : (user.role === 'admin' ? undefined : -1)

    const result = courseRepository.listAll({
      instructorId,
      limit: 100
    })

    return NextResponse.json({
      success: true,
      courses: result.courses,
      total: result.total
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructors only.' }, { status: 403 })
    }
    console.error('Fetch instructor courses error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve courses.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = courseCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : 1

    const data = parsed.data
    const courseId = courseRepository.create({
      title: data.title,
      slug: data.slug,
      course_category_id: data.category_id || 1,
      instructor_id: instructorId,
      level: data.level,
      pricing_type: data.pricing_type,
      price: data.price,
      discount: data.discount,
      discount_price: data.discount_price,
      short_description: data.short_description || null,
      description: data.description || null,
      thumbnail: data.thumbnail || null,
      status: 'draft'
    })

    return NextResponse.json({
      success: true,
      message: 'Course created successfully.',
      courseId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create course error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create course.' }, { status: 500 })
  }
}
