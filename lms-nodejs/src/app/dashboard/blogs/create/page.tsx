'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'

export default function CreateBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('1')
  const [categories, setCategories] = useState<any[]>([])
  const [thumbnail, setThumbnail] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/categories/blog')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    try {
      setSaving(true)
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          category_id: categoryId,
          thumbnail: thumbnail.trim(),
          description: description.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/blogs')
        }, 1200)
      } else {
        alert(data.message || 'Failed to publish blog post.')
      }
    } catch (err) {
      console.error('Error creating blog article:', err)
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
          <Link href="/dashboard/blogs" className="hover:text-foreground">Blogs</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Create Article</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Write Blog Article</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publish educational articles, thought leadership, guides, and platform tutorials.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Article published successfully! Redirecting to blogs dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">Article Title</Label>
              <Input
                id="title"
                placeholder="e.g. Modern Web Architecture with Next.js 15"
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
                <Label htmlFor="slug" className="text-xs font-semibold">Slug</Label>
                <Input
                  id="slug"
                  placeholder="e.g. modern-web-architecture-nextjs-15"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat" className="text-xs font-semibold">Category</Label>
                <select
                  id="cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 bg-background border border-input rounded-md px-3 text-xs"
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.title || c.name}</option>
                    ))
                  ) : (
                    <option value="1">Engineering & Tech</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="thumb" className="text-xs font-semibold">Thumbnail URL (Optional)</Label>
              <Input
                id="thumb"
                placeholder="https://..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content" className="text-xs font-semibold">Content</Label>
              <Textarea
                id="content"
                rows={10}
                placeholder="Write your article in Markdown or HTML..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/dashboard/blogs">Cancel</Link>
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#007867] hover:bg-[#007867]/90 text-white font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Article
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
