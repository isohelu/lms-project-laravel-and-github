'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  Building,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InstructorPayoutsPage() {
  const [balance, setBalance] = useState(8450)
  const [pendingAmount, setPendingAmount] = useState(0)
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [withdrawAmount, setWithdrawAmount] = useState('500')
  const [method, setMethod] = useState<'stripe' | 'paypal' | 'bank'>('stripe')
  const [notes, setNotes] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loadPayouts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/payouts')
      if (res.ok) {
        const data = await res.json()
        if (data.balance !== undefined) setBalance(data.balance)
        if (data.pendingAmount !== undefined) setPendingAmount(data.pendingAmount)
        if (data.payouts) setPayouts(data.payouts)
      }
    } catch (err) {
      console.error('Error loading instructor payouts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayouts()
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRequesting(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const res = await fetch('/api/instructor/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          method,
          notes
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Withdrawal request submitted successfully for administrative review!')
        loadPayouts()
        setWithdrawAmount('')
        setNotes('')
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setErrorMsg(data.message || 'Failed to submit withdrawal request.')
      }
    } catch (err) {
      setErrorMsg('Error submitting payout request.')
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payouts & Revenue Withdrawals</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Configure your financial accounts and request withdrawal transfers.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-8 space-y-8">
        {/* Balance Overview & Request Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="p-6 md:col-span-4 border-border bg-primary text-primary-foreground space-y-3 rounded-2xl shadow-md">
            <p className="text-xs uppercase tracking-wider opacity-80 font-semibold">Available for Withdrawal</p>
            <h2 className="text-3xl font-extrabold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            {pendingAmount > 0 && (
              <p className="text-xs opacity-90">Pending Review: ${pendingAmount.toFixed(2)}</p>
            )}
            <p className="text-xs opacity-80 pt-1">Automated payout batch cycle runs bi-weekly.</p>
          </Card>

          <Card className="p-6 md:col-span-8 border-border bg-card rounded-2xl shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-4">Request Fund Withdrawal</h3>

            {successMsg && (
              <div className="p-3 mb-4 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-xs font-semibold">Amount to Withdraw (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="50"
                    step="0.01"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Payout Destination *</Label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-background border border-border rounded-lg text-xs font-semibold px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-9"
                  >
                    <option value="stripe">Stripe Express Connect</option>
                    <option value="paypal">PayPal Direct</option>
                    <option value="bank">Wire / Swift Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold">Transfer Memo / Wire Instructions</Label>
                <Input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Account number, routing code, or PayPal email"
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isRequesting} className="text-xs font-semibold">
                  {isRequesting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Processing Request...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3.5 w-3.5" />
                      Submit Withdrawal Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Payout History */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Withdrawal History & Transfer Receipts</h3>
          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading payout logs...</p>
            </div>
          ) : payouts.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No payout records found</p>
              <p className="text-xs text-muted-foreground mt-1">Submitted withdrawal requests will appear here with transfer statuses.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {payouts.map((log) => (
                <Card key={log.id} className="p-4 border-border bg-card shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">${Number(log.amount || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Method: {log.payment_method || log.method || 'Standard'} • {log.date || 'Recently'}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    log.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {log.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {log.status || 'Pending'}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
