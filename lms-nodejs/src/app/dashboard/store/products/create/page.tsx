'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Upload,
  DollarSign,
  Package,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export default function CreateProductPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState('19.99')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      setSaving(true)
      const finalSlug = slug.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const res = await fetch('/api/instructor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: finalSlug,
          pricing_type: Number(price) > 0 ? 'paid' : 'free',
          price: Number(price) || 0,
          summary: summary.trim(),
          description: description.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/store/products')
        }, 1200)
      } else {
        alert(data.message || 'Failed to create product.')
      }
    } catch (err) {
      console.error('Error creating product:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/store/products" className="hover:text-foreground">Store</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Create Product</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Digital Product</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publish downloadable software packages, themes, books, or design templates.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Product created successfully! Redirecting to products list...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground">General Details</h2>
            
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">Product Title</Label>
              <Input
                id="title"
                placeholder="e.g. Next.js SaaS Boilerplate"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!slug) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                  }
                }}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs font-semibold">Product Slug</Label>
                <Input
                  id="slug"
                  placeholder="e.g. nextjs-saas-boilerplate"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold">Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summary" className="text-xs font-semibold">Short Summary</Label>
              <Input
                id="summary"
                placeholder="One sentence overview..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-xs font-semibold">Full Description</Label>
              <Textarea
                id="desc"
                rows={5}
                placeholder="Detail the features, included files, and setup instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/store/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#007867] hover:bg-[#007867]/90 text-white font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Product
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
