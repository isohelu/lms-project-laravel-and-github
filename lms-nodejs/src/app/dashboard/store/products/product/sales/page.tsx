'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProductSalesPage() {
  const [sales, setSales] = useState<any[]>([])
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadSales = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/sales')
      if (res.ok) {
        const data = await res.json()
        if (data.analytics) {
          setSales(data.analytics.recentSales || [])
          setRevenue(data.analytics.totalProductRevenue || 0)
        }
      }
    } catch (err) {
      console.error('Error loading product sales:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const filtered = sales.filter((s) => {
    const term = search.toLowerCase()
    return (
      (s.product_title && s.product_title.toLowerCase().includes(term)) ||
      (s.student_name && s.student_name.toLowerCase().includes(term)) ||
      (s.student_email && s.student_email.toLowerCase().includes(term))
    )
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/store/products" className="hover:text-foreground">Store</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Sales</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Sales & Orders</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track customer orders, digital product licenses, and revenue streams.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Sales Count</p>
              <p className="text-2xl font-bold text-foreground mt-1">{sales.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-5 border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Product Revenue</p>
              <p className="text-2xl font-bold text-foreground mt-1">${revenue.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search product or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Sales Table */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading orders history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No product orders found</p>
              <p className="text-xs text-muted-foreground mt-1">Customer purchases will be logged here immediately.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-muted-foreground">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{order.student_name || 'Customer'}</p>
                        <p className="text-[11px] text-muted-foreground">{order.student_email || ''}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {order.product_title || 'Digital Product'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        ${order.total || order.unit_price || '0.00'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
