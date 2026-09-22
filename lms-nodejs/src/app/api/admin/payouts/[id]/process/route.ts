import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const processSchema = z.object({
  status: z.enum(['completed', 'rejected']),
  transaction_id: z.string().optional()
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin'])
    const { id } = await context.params
    const payoutId = parseInt(id, 10)

    if (isNaN(payoutId)) {
      return NextResponse.json({ success: false, message: 'Invalid payout ID.' }, { status: 400 })
    }

    const body = await req.json()
    const parsed = processSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { status, transaction_id } = parsed.data

    const stmt = db.prepare(`
      UPDATE payout_histories SET
        status = ?,
        transaction_id = COALESCE(?, transaction_id),
        updated_at = datetime('now')
      WHERE id = ?
    `)
    const res = stmt.run(status, transaction_id || null, payoutId)

    if (res.changes === 0) {
      return NextResponse.json({ success: false, message: 'Payout record not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Payout marked as ${status}.`
    })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 })
    }
    console.error('Process payout error:', error)
    return NextResponse.json({ success: false, message: 'Failed to process payout.' }, { status: 500 })
  }
}
