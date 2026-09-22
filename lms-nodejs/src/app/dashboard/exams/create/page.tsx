'use client'

import React from 'react'
import CreateExamWizardView from '@/components/dashboard/views/CreateExamWizardView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <CreateExamWizardView />
    </DashboardLayout>
  )
}
