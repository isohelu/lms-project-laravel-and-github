import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import { courseRepository } from '@/lib/repositories/courseRepository'
import db from '@/lib/db'

const lessonSchema = z.object({
  course_section_id: z.number().int().positive(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  lesson_type: z.enum(['video', 'text', 'document', 'youtube', 'vimeo']).default('video'),
  lesson_src: z.string().optional(),
  duration: z.string().optional(),
  is_free: z.boolean().default(false),
  description: z.string().optional()
})

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const { id } = await context.params
    const courseId = parseInt(id, 10)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, message: 'Invalid course ID.' }, { status: 400 })
    }

    const course = courseRepository.findById(courseId)
    if (!course) {
      return NextResponse.json({ success: false, message: 'Course not found.' }, { status: 404 })
    }

    const instructor = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(user.id) as { id: number } | undefined
    if (user.role !== 'admin' && (!instructor || course.instructor_id !== instructor.id)) {
      return NextResponse.json({ success: false, message: 'Forbidden. You do not own this course.' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = lessonSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const data = parsed.data

    const lessonCount = (db.prepare(
      'SELECT COUNT(*) as c FROM section_lessons WHERE course_id = ?'
    ).get(courseId) as { c: number }).c + 1

    const stmt = db.prepare(`
      INSERT INTO section_lessons (
        title, sort, status, lesson_type, lesson_src, duration,
        is_free, description, lesson_number, course_id, course_section_id,
        created_at, updated_at
      ) VALUES (
        @title, @sort, 1, @lesson_type, @lesson_src, @duration,
        @is_free, @description, @lesson_number, @course_id, @course_section_id,
        datetime('now'), datetime('now')
      )
    `)

    const res = stmt.run({
      title: data.title,
      sort: lessonCount,
      lesson_type: data.lesson_type,
      lesson_src: data.lesson_src || null,
      duration: data.duration || null,
      is_free: data.is_free ? 1 : 0,
      description: data.description || null,
      lesson_number: lessonCount,
      course_id: courseId,
      course_section_id: data.course_section_id
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson added successfully.',
      lessonId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create lesson error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create lesson.' }, { status: 500 })
  }
}
