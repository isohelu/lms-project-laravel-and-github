'use client'

import React from 'react'
import AdminBlogsView from '@/components/dashboard/views/AdminBlogsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <AdminBlogsView />
    </DashboardLayout>
  )
}
