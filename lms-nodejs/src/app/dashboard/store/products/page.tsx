'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  DollarSign,
  Package
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardManageProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/products')
      if (res.ok) {
        const data = await res.json()
        if (data.products) {
          setProducts(data.products)
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = products.filter((p) =>
    p.title && p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Store</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Products</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage digital store inventory, downloadable assets, e-books, and starter templates.
            </p>
          </div>

          <Button asChild className="rounded-xl font-semibold gap-2 shadow-xs bg-[#007867] hover:bg-[#007867]/90 text-white">
            <Link href="/dashboard/store/products/create">
              <PlusCircle className="h-4 w-4" />
              Create Product
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search product title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Products Table */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading store products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No digital products found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Add digital templates, assets, or software files.</p>
              <Button asChild size="sm" className="bg-[#007867] hover:bg-[#007867]/90 text-white">
                <Link href="/dashboard/store/products/create">Create Product</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 flex items-center justify-center text-slate-400">
                            {item.thumbnail ? (
                              <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground">ID: #{item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {item.price ? `$${item.price}` : 'Free'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.category?.name || item.category || 'General'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                          {item.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Link href={`/products/${item.slug || item.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
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
