'use client'

import React from 'react'
import CourseBuilderView from '@/components/dashboard/views/CourseBuilderView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <CourseBuilderView />
    </DashboardLayout>
  )
}
