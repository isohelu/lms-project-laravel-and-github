import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const reviewSchema = z.object({
  item_type: z.enum(['course', 'exam', 'product']),
  item_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(3, 'Review must be at least 3 characters')
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'admin'])
    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { item_type, item_id, rating, review } = parsed.data

    if (item_type === 'course') {
      const stmt = db.prepare(`
        INSERT INTO course_reviews (user_id, course_id, rating, review, likes, dislikes, created_at, updated_at)
        VALUES (?, ?, ?, ?, '[]', '[]', datetime('now'), datetime('now'))
      `)
      stmt.run(user.id, item_id, rating, review)
    } else if (item_type === 'exam') {
      const stmt = db.prepare(`
        INSERT INTO exam_reviews (user_id, exam_id, rating, review, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      stmt.run(user.id, item_id, rating, review)
    } else if (item_type === 'product') {
      const stmt = db.prepare(`
        INSERT INTO product_reviews (user_id, product_id, rating, review, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      stmt.run(user.id, item_id, rating, review)
    }

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully.'
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    console.error('Submit review error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit review.' }, { status: 500 })
  }
}
