'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Tag, Trash2, Calendar, Check, ArrowLeft, Percent, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InstructorCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState('25')
  const [isCreating, setIsCreating] = useState(false)

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/coupons')
      if (res.ok) {
        const data = await res.json()
        if (data.coupons) {
          setCoupons(data.coupons)
        }
      }
    } catch (err) {
      console.error('Error loading coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/instructor/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.toUpperCase().trim(),
          discount_type: 'percent',
          discount: Number(newDiscount),
          expiry_date: '2026-12-31'
        })
      })
      const data = await res.json()
      if (data.success) {
        loadCoupons()
        setNewCode('')
      } else {
        alert(data.message || 'Failed to create coupon.')
      }
    } catch (err) {
      alert('Error creating coupon.')
    } finally {
      setIsCreating(false)
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
              <h1 className="text-2xl font-bold text-foreground">Discount Coupons & Promotions</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Generate customized promotional codes to boost your course conversion rate.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-8 space-y-8">
        {/* Create Coupon Card */}
        <Card className="p-6 border-border bg-card">
          <h3 className="text-base font-bold text-foreground mb-4">Create New Promotion Code</h3>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1 w-full">
              <Label htmlFor="code" className="text-xs font-semibold">Coupon Code *</Label>
              <Input
                id="code"
                placeholder="e.g. SUMMER2026"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                required
                className="font-mono uppercase text-xs"
              />
            </div>

            <div className="space-y-1.5 w-full sm:w-40">
              <Label htmlFor="discount" className="text-xs font-semibold">Discount (%) *</Label>
              <Input
                id="discount"
                type="number"
                min="5"
                max="90"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <Button type="submit" disabled={isCreating} className="w-full sm:w-auto text-xs font-semibold">
              {isCreating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Generate Coupon
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Coupon List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground">Active Promotional Codes</h3>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading active coupons...</p>
            </div>
          ) : coupons.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No coupons generated yet</p>
              <p className="text-xs text-muted-foreground mt-1">Use the generator above to create promotional discount codes.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <Card key={c.id} className="p-5 border-border bg-card shadow-sm flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-primary px-2.5 py-1 bg-primary/10 rounded-lg">
                        {c.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {c.status || 'Active'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl font-black text-foreground">{c.discount}%</span>
                      <span className="text-xs text-muted-foreground">OFF</span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Valid through {c.expiry_date || c.expires || 'Dec 31, 2026'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
