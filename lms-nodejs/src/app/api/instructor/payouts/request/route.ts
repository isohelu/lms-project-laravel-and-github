import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth/session'
import db from '@/lib/db'

const payoutRequestSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be greater than zero'),
  payout_method: z.enum(['paypal', 'stripe', 'bank_transfer', 'offline']).default('paypal')
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['instructor', 'admin'])
    const body = await req.json()
    const parsed = payoutRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { amount, payout_method } = parsed.data

    const stmt = db.prepare(`
      INSERT INTO payout_histories (
        payout_method, amount, status, user_id, created_at, updated_at
      ) VALUES (
        ?, ?, 'pending', ?, datetime('now'), datetime('now')
      )
    `)
    const res = stmt.run(payout_method, amount, user.id)

    return NextResponse.json({
      success: true,
      message: 'Payout withdrawal request submitted successfully.',
      payoutId: Number(res.lastInsertRowid)
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, message: 'Forbidden. Instructors only.' }, { status: 403 })
    }
    console.error('Request payout error:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit withdrawal request.' }, { status: 500 })
  }
}
