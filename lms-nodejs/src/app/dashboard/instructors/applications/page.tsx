'use client'

import React from 'react'
import InstructorApplicationsView from '@/components/dashboard/views/InstructorApplicationsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <InstructorApplicationsView />
    </DashboardLayout>
  )
}
