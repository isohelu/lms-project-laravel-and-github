import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const categoryCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  icon: z.string().optional(),
  description: z.string().optional()
})

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await context.params

    let table = 'course_categories'
    let titleCol = 'title'

    if (type === 'exam') {
      table = 'exam_categories'
    } else if (type === 'product') {
      table = 'product_categories'
    } else if (type === 'blog') {
      table = 'blog_categories'
      titleCol = 'name'
    }

    const categories = db.prepare(`
      SELECT id, ${titleCol} as title, slug, icon, sort, status, description, created_at
      FROM ${table}
      ORDER BY sort ASC, id ASC
    `).all()

    return NextResponse.json({
      success: true,
      categories
    })
  } catch (error: unknown) {
    console.error('Fetch categories error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve categories.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  try {
    await requireRole(['admin'])
    const { type } = await context.params

    let table = 'course_categories'
    let titleCol = 'title'

    if (type === 'exam') {
      table = 'exam_categories'
    } else if (type === 'product') {
      table = 'product_categories'
    } else if (type === 'blog') {
      table = 'blog_categories'
      titleCol = 'name'
    }

    const body = await req.json()
    const parsed = categoryCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { title, slug, icon, description } = parsed.data

    const stmt = db.prepare(`
      INSERT INTO ${table} (${titleCol}, slug, icon, sort, status, description, created_at, updated_at)
      VALUES (?, ?, ?, 0, 1, ?, datetime('now'), datetime('now'))
    `)
    const res = stmt.run(title, slug, icon || 'tag', description || null)

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      categoryId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Create category error:', error)
    return NextResponse.json({ success: false, message: 'Failed to create category.' }, { status: 500 })
  }
}
