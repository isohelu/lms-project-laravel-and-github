'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  PlusCircle,
  Search,
  Eye,
  MapPin,
  Clock,
  Calendar,
  Loader2,
  DollarSign
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardJobCircularsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/jobs')
      if (res.ok) {
        const data = await res.json()
        if (data.jobs) {
          setJobs(data.jobs)
        }
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  const filtered = jobs.filter((j) =>
    j.title && j.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground font-medium">Job Circulars</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Job Circulars</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Post, manage, and review employment vacancies, internships, and educator roles.
            </p>
          </div>

          <Button asChild className="rounded-xl font-semibold gap-2 shadow-xs bg-[#007867] hover:bg-[#007867]/90 text-white">
            <Link href="/dashboard/job-circulars/create">
              <PlusCircle className="h-4 w-4" />
              Create Job
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4 border-slate-200/80 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-background"
            />
          </div>
        </Card>

        {/* Jobs Table */}
        <Card className="border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#007867] mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Loading job vacancies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No circulars posted</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Create job postings to hire instructors or developers.</p>
              <Button asChild size="sm" className="bg-[#007867] hover:bg-[#007867]/90 text-white">
                <Link href="/dashboard/job-circulars/create">Create Job</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Position</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold text-foreground">{job.title}</p>
                          <p className="text-[11px] text-muted-foreground">ID: #{job.id}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize text-muted-foreground">
                        {job.job_type || 'Full-time'} ({job.work_type || 'Remote'})
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{job.location || 'Remote'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {job.application_deadline || 'Open'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">
                          Active
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Link href={`/job-circulars/${job.id}`}>
                            <Eye className="h-4 w-4" />
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
