'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Search,
  Edit,
  Eye,
  Book,
  Users,
  Loader2,
  Clock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardManageExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadExams = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instructor/exams')
      if (res.ok) {
        const data = await res.json()
        if (data.exams) {
          setExams(data.exams)
        }
      }
    } catch (err) {
      console.error('Error loading exams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExams()
  }, [])

  const toggleStatus = async (examId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/exams/${examId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      if (res.ok) {
        setExams(prev =>
          prev.map(e => (e.id === examId ? { ...e, status: nextStatus } : e))
        )
      }
    } catch (err) {
      console.error('Failed to toggle exam status:', err)
    }
  }

  const filtered = exams.filter((e) =>
    e.title && e.title.toLowerCase().includes(search.toLowerCase())
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
              <span className="text-foreground font-medium">Exams</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Exams</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create, configure, and monitor exam questions, durations, and passing grades.
            </p>
          </div>

          <Button asChild className="rounded-xl font-semibold gap-2 shadow-xs bg-[#007867] hover:bg-[#007867]/90 text-white">
            <Link href="/dashboard/exams/create">
              <PlusCircle className="h-4 w-4" />
              Create Exam
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Table Card */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading exams...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Book className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No exams found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Create your first examination to assess learners.</p>
              <Button asChild size="sm" className="bg-[#007867] hover:bg-[#007867]/90 text-white">
                <Link href="/dashboard/exams/create">Create Exam</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Exam Title</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Pass Mark</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((exam) => {
                    const isPublished = exam.status === 'published'
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold text-foreground">{exam.title}</p>
                            <p className="text-[11px] text-muted-foreground">ID: #{exam.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{exam.duration || 60} mins</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {exam.pass_mark || 70}%
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">
                          {exam.price ? `$${exam.price}` : 'Free'}
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
                              onClick={() => toggleStatus(exam.id, exam.status)}
                              className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              {isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Link href={`/exams/${exam.slug || exam.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Link href={`/dashboard/exams/create?edit=${exam.id}`}>
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
