import { NextRequest, NextResponse } from 'next/server'
import { courseRepository } from '@/lib/repositories/courseRepository'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const offset = (page - 1) * limit
    const instructorId = searchParams.get('instructor_id') ? parseInt(searchParams.get('instructor_id')!, 10) : undefined

    const result = courseRepository.listAll({
      categorySlug: category,
      search,
      status: 'approved',
      limit,
      offset,
      instructorId
    })

    return NextResponse.json({
      success: true,
      courses: result.courses,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error: unknown) {
    console.error('Fetch courses error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve courses.' },
      { status: 500 }
    )
  }
}
