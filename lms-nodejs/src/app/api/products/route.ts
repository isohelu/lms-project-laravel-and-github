import { NextRequest, NextResponse } from 'next/server'
import { productRepository } from '@/lib/repositories/productRepository'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const pricingType = searchParams.get('pricing_type') || undefined
    const featuredParam = searchParams.get('featured')
    const featured = featuredParam !== null ? featuredParam === 'true' || featuredParam === '1' : undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const offset = (page - 1) * limit
    const instructorId = searchParams.get('instructor_id') ? parseInt(searchParams.get('instructor_id')!, 10) : undefined

    const result = productRepository.listAll({
      categorySlug: category,
      search,
      pricingType,
      featured,
      status: 'approved',
      limit,
      offset,
      instructorId
    })

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    })
  } catch (error: unknown) {
    console.error('Fetch products error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products.' },
      { status: 500 }
    )
  }
}
