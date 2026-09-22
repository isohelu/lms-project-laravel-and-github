'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  FolderTree,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
  Layers
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function CourseCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openAddModal, setOpenAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)

  const loadCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/categories/course')
      if (res.ok) {
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
        }
      }
    } catch (err) {
      console.error('Error fetching course categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      setSaving(true)
      const slug = newSlug.trim() || newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const res = await fetch('/api/categories/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug,
          description: newDesc.trim()
        })
      })
      if (res.ok) {
        setOpenAddModal(false)
        setNewTitle('')
        setNewSlug('')
        setNewDesc('')
        loadCategories()
      }
    } catch (err) {
      console.error('Error creating category:', err)
    } finally {
      setSaving(false)
    }
  }

  const filtered = categories.filter((c) =>
    c.title && c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <Link href="/dashboard/courses" className="hover:text-foreground">Courses</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Categories</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Categories</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Organize and classify course catalog structures and sub-categories.
            </p>
          </div>

          <Button
            onClick={() => setOpenAddModal(true)}
            className="rounded-xl font-semibold gap-2 shadow-xs bg-[#007867] hover:bg-[#007867]/90 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>

          <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Course Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Category Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Artificial Intelligence"
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value)
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-xs font-semibold">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g. artificial-intelligence"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
                  <Input
                    id="desc"
                    placeholder="Brief summary..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpenAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-[#007867] hover:bg-[#007867]/90 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Category'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search category title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Categories Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Loading course categories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <FolderTree className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No categories found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first category to organize courses.</p>
            <Button size="sm" onClick={() => setOpenAddModal(true)} className="bg-[#007867] hover:bg-[#007867]/90 text-white">
              Add Category
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((cat) => (
              <Card key={cat.id} className="p-5 border-slate-200/80 shadow-xs hover:border-[#007867]/40 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-[#007867]/10 flex items-center justify-center text-[#007867]">
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {cat.description || `Slug: /${cat.slug}`}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-muted-foreground">
                  <span>ID: #{cat.id}</span>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs hover:text-foreground">
                      <Link href={`/courses?category=${cat.slug}`}>View Courses</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
