'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Search,
  CheckCircle2,
  UserX,
  UserCheck,
  Shield,
  Loader2,
  Mail
} from 'lucide-react'

interface UserItem {
  id: number
  name: string
  email: string
  role: 'admin' | 'instructor' | 'student'
  status?: string
  created_at?: string
  photo?: string
}

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        if (data.users) {
          setUsers(data.users)
        }
      }
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleStatus = async (id: number, currentStatus: string = 'Active') => {
    const nextStatus = currentStatus === 'Active' || currentStatus === 'active' ? 'suspended' : 'active'
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => u.id === id ? { ...u, status: nextStatus === 'active' ? 'Active' : 'Suspended' } : u)
        )
      }
    } catch (err) {
      console.error('Error toggling user status:', err)
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
    const matchesRole = roleFilter === 'all' || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase())
    return matchesSearch && matchesRole
  })

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground font-medium">All Users</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directory</h1>
            <p className="text-xs text-muted-foreground">Manage platform accounts, security permissions, and privileges.</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-xs bg-white rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground font-medium">Role:</span>
            <div className="flex rounded-xl border border-border bg-white p-1 text-xs">
              {(['all', 'admin', 'instructor', 'student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    roleFilter === r
                      ? 'bg-[#007867] text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Card className="rounded-2xl border border-border/80 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-slate-50/70 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Registered</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const isSuspended = user.status === 'Suspended' || user.status === 'suspended'
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-[13px]">{user.name}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <Badge
                            variant="secondary"
                            className={`capitalize text-[11px] font-semibold ${
                              user.role === 'admin'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : user.role === 'instructor'
                                ? 'bg-emerald-50 text-[#007867] border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {user.role}
                          </Badge>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              isSuspended
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`} />
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-muted-foreground">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus(user.id, user.status)}
                            className={`h-8 text-xs font-semibold gap-1.5 rounded-lg ${
                              isSuspended
                                ? 'text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                                : 'text-red-700 hover:bg-red-50 hover:border-red-300'
                            }`}
                          >
                            {isSuspended ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Unsuspend</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
