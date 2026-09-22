'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  FolderTree,
  ChevronRight,
  Layers,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StoreCategory {
  id: number
  name: string
  slug: string
  productsCount: number
  description: string
  status: 'Active' | 'Hidden'
}

const INITIAL_STORE_CATEGORIES: StoreCategory[] = [
  {
    id: 1,
    name: 'Full Application Source Code',
    slug: 'source-code',
    productsCount: 14,
    description: 'Production-ready Next.js, Node.js, and Flutter backend and mobile app boilerplates.',
    status: 'Active',
  },
  {
    id: 2,
    name: 'UI Kits & Design Systems',
    slug: 'ui-kits',
    productsCount: 9,
    description: 'Figma and Tailwind CSS component libraries with dark mode tokens.',
    status: 'Active',
  },
  {
    id: 3,
    name: 'E-Books & Cheatsheets',
    slug: 'ebooks',
    productsCount: 22,
    description: 'Architecture reference handbooks, interview flashcards, and cheat sheets.',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Audio & Media Assets',
    slug: 'media-assets',
    productsCount: 6,
    description: 'Royalty-free background tracks, sound effects, and 3D icons.',
    status: 'Active',
  }
]

export default function AdminStoreCategoriesPage() {
  const [categories, setCategories] = useState<StoreCategory[]>(INITIAL_STORE_CATEGORIES)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [search, setSearch] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return

    const slug = newCatName.toLowerCase().replace(/\s+/g, '-')
    setCategories(prev => [
      ...prev,
      {
        id: prev.length + 1,
        name: newCatName.trim(),
        slug,
        productsCount: 0,
        description: newCatDesc.trim() || 'Digital product collection.',
        status: 'Active',
      }
    ])

    setNewCatName('')
    setNewCatDesc('')
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="border-b border-border bg-background px-6 py-6 shadow-sm">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Admin Portal</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-semibold">Digital Store</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Digital Store Categories & Hierarchy</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize downloadable assets, source code repositories, and store coupons.
            </p>
          </div>

          <Button asChild size="sm" className="font-bold gap-2 shadow-sm self-start sm:self-auto">
            <Link href="/products">
              <ShoppingBag className="h-4 w-4" />
              View Digital Shop
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 max-w-6xl py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto text-xs font-semibold">
          <Link href="/dashboard" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Overview</Link>
          <Link href="/dashboard/users" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Users & Roles</Link>
          <Link href="/dashboard/instructors/applications" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Instructor Applications</Link>
          <Link href="/dashboard/billings/payment" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Gateways</Link>
          <Link href="/dashboard/billings/payment-reports/offline" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Offline Bank Wire</Link>
          <Link href="/dashboard/billings/payouts/request" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Payouts Ledger</Link>
          <Link href="/dashboard/blogs" className="rounded-lg text-muted-foreground hover:text-foreground px-3 py-1.5">Blog Articles</Link>
          <Link href="/dashboard/store/categories" className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5">Digital Store</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Create Category Form */}
          <Card className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h2 className="text-base font-bold text-foreground">Add New Store Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Name</label>
                <Input
                  placeholder="e.g. Mobile App Templates"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                  className="bg-background border-border text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                <Input
                  placeholder="Brief summary of items in this category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="bg-background border-border text-sm"
                />
              </div>

              <Button type="submit" className="w-full text-xs font-bold shadow-sm">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Create Category
              </Button>
            </form>
          </Card>

          {/* Category List Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>

            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Category Name</th>
                      <th className="py-3.5 px-4">Products</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(cat => (
                      <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-foreground">{cat.name}</div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{cat.description}</p>
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-primary">
                          {cat.productsCount} items
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 text-xs">
                            {cat.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cat.id)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
