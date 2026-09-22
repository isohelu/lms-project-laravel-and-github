import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discount: z.number().positive(),
  discount_type: z.enum(['percentage', 'fixed']).default('percentage'),
  course_id: z.number().int().positive().optional()
})

export async function GET() {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const coupons = db.prepare(`
      SELECT * FROM course_coupons WHERE user_id = ? ORDER BY id DESC
    `).all(user.id)

    return NextResponse.json({
      success: true,
      coupons
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    return NextResponse.json({ success: false, message: 'Failed to fetch coupons.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = couponSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { code, discount, discount_type, course_id } = parsed.data

    const existing = db.prepare('SELECT id FROM course_coupons WHERE code = ?').get(code)
    if (existing) {
      return NextResponse.json({ success: false, message: 'Coupon code already exists.' }, { status: 409 })
    }

    const stmt = db.prepare(`
      INSERT INTO course_coupons (
        code, discount, discount_type, course_id, user_id, is_active,
        used_count, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, 1, 0, datetime('now'), datetime('now')
      )
    `)
    const res = stmt.run(code, discount, discount_type, course_id || null, user.id)

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully.',
      couponId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden.' }, { status: 403 })
    }
    console.error('Create coupon error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create coupon.' }, { status: 500 })
  }
}
