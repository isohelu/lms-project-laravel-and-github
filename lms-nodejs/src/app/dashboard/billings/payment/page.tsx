'use client'

import React from 'react'
import PaymentGatewaysView from '@/components/dashboard/views/PaymentGatewaysView'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardSubPage() {
  return (
    <DashboardLayout>
      <PaymentGatewaysView />
    </DashboardLayout>
  )
}
