import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { examRepository } from '@/lib/repositories/examRepository'
import db from '@/lib/db'

const examCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category_id: z.number().int().positive().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  duration_hours: z.number().int().min(0).default(1),
  duration_minutes: z.number().int().min(0).max(59).default(0),
  pass_mark: z.number().min(0).default(60),
  total_marks: z.number().min(1).default(100),
  max_attempts: z.number().int().min(1).default(1),
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

    const result = examRepository.listAll({
      instructorId,
      limit: 100
    })

    return NextResponse.json({
      success: true,
      exams: result.exams,
      total: result.total
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Fetch instructor exams error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve exams.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = examCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    const instructorId = instructor ? instructor.id : 1

    const data = parsed.data
    const examId = examRepository.create({
      title: data.title,
      slug: data.slug,
      exam_category_id: data.category_id || 1,
      instructor_id: instructorId,
      level: data.level,
      duration_hours: data.duration_hours,
      duration_minutes: data.duration_minutes,
      pass_mark: data.pass_mark,
      total_marks: data.total_marks,
      max_attempts: data.max_attempts,
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
      message: 'Exam created successfully.',
      examId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create exam error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create exam.' }, { status: 500 })
  }
}
