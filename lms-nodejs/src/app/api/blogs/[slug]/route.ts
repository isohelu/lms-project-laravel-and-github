import { NextRequest, NextResponse } from 'next/server'
import { blogRepository } from '@/lib/repositories/blogRepository'
import { requireRole } from '@/lib/auth/session'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const blog = blogRepository.findBySlug(slug) || blogRepository.findByUuid(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const comments = blogRepository.getComments(blog.id)

    return NextResponse.json({
      success: true,
      blog,
      comments
    })
  } catch (error: unknown) {
    console.error('Fetch blog post error:', error)
    return NextResponse.json({ success: false, message: 'Failed to retrieve article.' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireRole(['student', 'admin', 'instructor'])
    const { slug } = await context.params
    const blog = blogRepository.findBySlug(slug) || blogRepository.findByUuid(slug)

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Article not found.' }, { status: 404 })
    }

    const body = await req.json()
    const content = typeof body.content === 'string' ? body.content.trim() : ''

    if (!content) {
      return NextResponse.json({ success: false, message: 'Comment content cannot be empty.' }, { status: 422 })
    }

    const commentId = blogRepository.addComment(blog.id, user.id, content, body.parent_id || null)

    return NextResponse.json({
      success: true,
      message: 'Comment posted successfully.',
      commentId
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Please log in to leave a comment.' }, { status: 401 })
    }
    console.error('Post blog comment error:', error)
    return NextResponse.json({ success: false, message: 'Failed to post comment.' }, { status: 500 })
  }
}
