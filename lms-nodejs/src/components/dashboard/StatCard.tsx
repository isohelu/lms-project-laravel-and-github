'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  iconBgClass?: string
}

export default function StatCard({ title, value, icon, iconBgClass = 'bg-slate-100' }: StatCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h4 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </h4>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105',
            iconBgClass
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  )
}
