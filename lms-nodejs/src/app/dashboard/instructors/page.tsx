'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Search,
  PlusCircle,
  Mail,
  Eye,
  CheckCircle2,
  Loader2,
  GraduationCap
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardManageInstructorsPage() {
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadInstructors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users?role=instructor')
      if (res.ok) {
        const data = await res.json()
        if (data.users) {
          setInstructors(data.users)
        }
      }
    } catch (err) {
      console.error('Error loading instructors:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInstructors()
  }, [])

  const filtered = instructors.filter((inst) => {
    const term = search.toLowerCase()
    return (
      (inst.name && inst.name.toLowerCase().includes(term)) ||
      (inst.email && inst.email.toLowerCase().includes(term))
    )
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Instructors</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Instructors</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review certified teaching faculty, course authors, and tutor permissions.
            </p>
          </div>

          <Button asChild className="rounded-xl font-semibold gap-2 shadow-xs bg-[#007867] hover:bg-[#007867]/90 text-white">
            <Link href="/dashboard/instructors/create">
              <PlusCircle className="h-4 w-4" />
              Create Instructor
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search instructor name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Instructors Table */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading instructors directory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No instructors found</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first educator or approve pending applications.</p>
              <Button asChild size="sm" className="bg-[#007867] hover:bg-[#007867]/90 text-white">
                <Link href="/dashboard/instructors/create">Add Instructor</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[#007867]/10 text-[#007867] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {(inst.name || 'I')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{inst.name}</p>
                            <p className="text-[11px] text-muted-foreground">ID: #{inst.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {inst.email}
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {inst.headline || 'Course Instructor'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                          Verified
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#007867] hover:text-[#007867]">
                          <Link href={`/instructors/${inst.id}`} target="_blank">
                            <Eye className="h-3.5 w-3.5 mr-1" /> Public Page
                          </Link>
                        </Button>
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
