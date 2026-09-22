'use client'

import React from 'react'
import PayoutsView from '@/components/dashboard/views/PayoutsView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <PayoutsView />
    </DashboardLayout>
  )
}
