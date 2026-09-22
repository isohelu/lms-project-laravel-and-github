'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardManageCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const loadCourses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/courses')
      if (res.ok) {
        const data = await res.json()
        if (data.courses) {
          setCourses(data.courses)
        }
      }
    } catch (err) {
      console.error('Error loading courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const toggleStatus = async (courseId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      if (res.ok) {
        setCourses(prev =>
          prev.map(c => (c.id === courseId ? { ...c, status: nextStatus } : c))
        )
      }
    } catch (err) {
      console.error('Failed to toggle course status:', err)
    }
  }

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title && c.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Courses</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Courses</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review, edit, and publish your course curriculum catalog.
            </p>
          </div>

          <Button asChild className="rounded-xl font-semibold gap-2 shadow-xs bg-[#007867] hover:bg-[#007867]/90 text-white">
            <Link href="/dashboard/courses/create">
              <PlusCircle className="h-4 w-4" />
              Create Course
            </Link>
          </Button>
        </div>

        {/* Controls Card */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs bg-background"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-background border border-slate-200 rounded-lg text-xs font-medium px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-[#007867]"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Courses Table */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading courses catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No courses found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Try adjusting your filters or create a new course.</p>
              <Button asChild size="sm" className="bg-[#007867] hover:bg-[#007867]/90 text-white">
                <Link href="/dashboard/courses/create">Create Course</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Enrollments</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((course) => {
                    const isPublished = course.status === 'published'
                    return (
                      <tr key={course.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                              {course.thumbnail ? (
                                <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground line-clamp-1">{course.title}</p>
                              <p className="text-[11px] text-muted-foreground">ID: #{course.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {course.price ? `$${course.price}` : 'Free'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {course.category?.name || course.category || 'General'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>{course.enrollments_count || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className={
                              isPublished
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          >
                            {isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStatus(course.id, course.status)}
                              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              {isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Link href={`/courses/${course.slug || course.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Link href={`/dashboard/courses/create?edit=${course.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
