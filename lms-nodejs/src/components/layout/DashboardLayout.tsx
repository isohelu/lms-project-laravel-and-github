'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  School,
  Book,
  ShoppingBag,
  FilePenLine,
  Palette,
  Briefcase,
  Users,
  CreditCard,
  Award,
  Newspaper,
  Globe,
  Settings,
  GitCompareArrows,
  ChevronDown,
  PanelLeft,
  Bell,
  LogOut,
  UserCheck
} from 'lucide-react'
import AppLogo from '@/components/common/AppLogo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface NavChild {
  name: string
  href: string
  access?: ('admin' | 'instructor')[]
}

export interface NavMenuItem {
  title: string
  href?: string
  icon: React.ElementType
  access: ('admin' | 'instructor')[]
  children?: NavChild[]
}

export const fullDashboardRoutes: NavMenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    access: ['admin', 'instructor'],
  },
  {
    title: 'Courses',
    icon: School,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/courses/categories', access: ['admin'] },
      { name: 'Manage Courses', href: '/dashboard/courses', access: ['admin', 'instructor'] },
      { name: 'Create Course', href: '/dashboard/courses/create', access: ['admin', 'instructor'] },
      { name: 'Course Coupons', href: '/dashboard/courses/course/coupons', access: ['admin'] },
      { name: 'Course Enrollments', href: '/dashboard/courses/course/enrollments', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Exams',
    icon: Book,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/exams/categories', access: ['admin'] },
      { name: 'Manage Exams', href: '/dashboard/exams', access: ['admin', 'instructor'] },
      { name: 'Create Exam', href: '/dashboard/exams/create', access: ['admin', 'instructor'] },
      { name: 'Exam Coupons', href: '/dashboard/exams/exam/coupons', access: ['admin'] },
      { name: 'Exam Enrollments', href: '/dashboard/exams/exam/enrollments', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Store',
    icon: ShoppingBag,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/store/categories', access: ['admin'] },
      { name: 'Manage Products', href: '/dashboard/store/products', access: ['admin', 'instructor'] },
      { name: 'Create Product', href: '/dashboard/store/products/create', access: ['admin', 'instructor'] },
      { name: 'Product Coupons', href: '/dashboard/store/products/product/coupons', access: ['admin'] },
      { name: 'Product Sales', href: '/dashboard/store/products/product/sales', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Blogs',
    icon: FilePenLine,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Categories', href: '/dashboard/blogs/categories', access: ['admin'] },
      { name: 'Create Blog', href: '/dashboard/blogs/create', access: ['admin', 'instructor'] },
      { name: 'Manage Blog', href: '/dashboard/blogs', access: ['admin', 'instructor'] },
    ],
  },
  {
    title: 'Frontend',
    icon: Palette,
    access: ['admin'],
    children: [
      { name: 'Pages', href: '/dashboard/frontend/pages', access: ['admin'] },
      { name: 'Page API', href: '/dashboard/frontend/api', access: ['admin'] },
    ],
  },
  {
    title: 'Job Circulars',
    icon: Briefcase,
    access: ['admin'],
    children: [
      { name: 'All Jobs', href: '/dashboard/job-circulars', access: ['admin'] },
      { name: 'Create Job', href: '/dashboard/job-circulars/create', access: ['admin'] },
    ],
  },
  {
    title: 'Instructors',
    icon: Users,
    access: ['admin'],
    children: [
      { name: 'Applications', href: '/dashboard/instructors/applications', access: ['admin'] },
      { name: 'Manage Instructors', href: '/dashboard/instructors', access: ['admin'] },
      { name: 'Create Instructor', href: '/dashboard/instructors/create', access: ['admin'] },
    ],
  },
  {
    title: 'Billings',
    icon: CreditCard,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Configuration', href: '/dashboard/billings/payment', access: ['admin'] },
      { name: 'Online Payments', href: '/dashboard/billings/payment-reports/online', access: ['admin'] },
      { name: 'Offline Payments', href: '/dashboard/billings/payment-reports/offline', access: ['admin'] },
      { name: 'Payout Request', href: '/dashboard/billings/payouts/request', access: ['admin'] },
      { name: 'Payout History', href: '/dashboard/billings/payouts/history', access: ['admin'] },
      { name: 'Withdraw', href: '/dashboard/billings/payouts', access: ['instructor'] },
      { name: 'Settings', href: '/dashboard/billings/payouts/settings', access: ['instructor'] },
    ],
  },
  {
    title: 'Certificate',
    icon: Award,
    access: ['admin'],
    children: [
      { name: 'Certificate', href: '/dashboard/certification/certificate', access: ['admin'] },
      { name: 'Marksheet', href: '/dashboard/certification/marksheet', access: ['admin'] },
    ],
  },
  {
    title: 'Newsletters',
    href: '/dashboard/newsletters',
    icon: Newspaper,
    access: ['admin'],
  },
  {
    title: 'All Users',
    href: '/dashboard/users',
    icon: UserCheck,
    access: ['admin'],
  },
  {
    title: 'Translation',
    href: '/dashboard/language',
    icon: Globe,
    access: ['admin'],
  },
  {
    title: 'Settings',
    icon: Settings,
    access: ['admin', 'instructor'],
    children: [
      { name: 'Account', href: '/dashboard/settings/account', access: ['admin', 'instructor'] },
      { name: 'System', href: '/dashboard/settings/system', access: ['admin'] },
      { name: 'Pages', href: '/dashboard/settings/pages', access: ['admin'] },
      { name: 'Storage', href: '/dashboard/settings/storage', access: ['admin'] },
      { name: 'SMTP', href: '/dashboard/settings/smtp', access: ['admin'] },
      { name: 'Plugins', href: '/dashboard/settings/plugins', access: ['admin'] },
      { name: 'Auth', href: '/dashboard/settings/auth0', access: ['admin'] },
      { name: 'Live Class', href: '/dashboard/settings/live-class', access: ['admin'] },
      { name: 'Meta Pixel', href: '/dashboard/settings/meta-pixel', access: ['admin'] },
      { name: 'Google Analytics', href: '/dashboard/settings/google-analytics', access: ['admin'] },
    ],
  },
  {
    title: 'Maintenance',
    href: '/dashboard/settings/maintenance',
    icon: GitCompareArrows,
    access: ['admin'],
  },
]

function computeInitialAccordions(pathname: string): Record<string, boolean> {
  const initial: Record<string, boolean> = {
    Courses: false,
    Exams: false,
    Store: false,
    Blogs: false,
    Frontend: false,
    'Job Circulars': false,
    Instructors: false,
    Billings: false,
    Certificate: false,
    Settings: false,
  }
  if (!pathname) return initial

  fullDashboardRoutes.forEach(item => {
    if (item.children) {
      const hasActiveChild = item.children.some(c => {
        if (pathname === c.href) return true
        if (pathname.startsWith(c.href + '/')) {
          const hasMoreSpecificSibling = item.children?.some(
            other => other.href !== c.href && other.href.length > c.href.length && (pathname === other.href || pathname.startsWith(other.href + '/'))
          )
          return !hasMoreSpecificSibling
        }
        return false
      })
      if (hasActiveChild) {
        initial[item.title] = true
      }
    }
  })
  return initial
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role?: 'admin' | 'instructor'
}

export default function DashboardLayout({
  children,
  role: initialRole
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentUser, setCurrentUser] = useState<{
    id?: number
    name?: string
    email?: string
    role?: 'admin' | 'instructor'
  } | null>(null)

  const activeRole: 'admin' | 'instructor' =
    initialRole ||
    currentUser?.role ||
    (pathname.startsWith('/instructor') ? 'instructor' : 'admin')

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(() => computeInitialAccordions(pathname))

  // Fetch logged in session
  const fetchAuthUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setCurrentUser(data.user)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchAuthUser()
  }, [fetchAuthUser])

  const toggleAccordion = (title: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Auto-expand active accordion if child path matches current route
  useEffect(() => {
    fullDashboardRoutes.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(c => {
          if (pathname === c.href) return true
          if (pathname.startsWith(c.href + '/')) {
            const hasMoreSpecificSibling = item.children?.some(
              other => other.href !== c.href && other.href.length > c.href.length && (pathname === other.href || pathname.startsWith(other.href + '/'))
            )
            return !hasMoreSpecificSibling
          }
          return false
        })
        if (hasActiveChild) {
          setOpenAccordions(prev => prev[item.title] ? prev : ({ ...prev, [item.title]: true }))
        }
      }
    })
  }, [pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    router.push('/login')
  }

  // Filter routes according to active user role
  const visibleRoutes = fullDashboardRoutes
    .filter(item => item.access.includes(activeRole))
    .map(item => ({
      ...item,
      children: item.children
        ? item.children.filter(child => !child.access || child.access.includes(activeRole))
        : undefined,
    }))

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : activeRole === 'admin' ? 'SA' : 'IN'

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-foreground antialiased font-sans">
      {/* Left Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out shadow-xs',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex h-16 items-center px-6 border-b border-transparent">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <AppLogo className="h-7 w-auto" />
          </Link>
        </div>

        {/* Navigation Section with Smooth Scrolling */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {sidebarOpen && (
            <div className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Main Menu
            </div>
          )}

          <nav className="space-y-1">
            {visibleRoutes.map((item) => {
              const Icon = item.icon
              const isDirectLink = !!item.href
              const isActive = item.href 
                ? (item.href === '/dashboard'
                    ? (pathname === '/dashboard' || pathname === '/admin/dashboard' || pathname === '/instructor/dashboard')
                    : (pathname === item.href || pathname.startsWith(item.href + '/')))
                : false
              const isOpen = openAccordions[item.title] || false

              if (isDirectLink) {
                return (
                  <Link
                    key={item.title}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                      isActive
                        ? 'bg-[#f1f5f9] text-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-[#f8fafc] hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                    {sidebarOpen && <span>{item.title}</span>}
                  </Link>
                )
              }

              return (
                <div key={item.title} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(item.title)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors text-muted-foreground hover:bg-[#f8fafc] hover:text-foreground',
                      isOpen && 'text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                      {sidebarOpen && <span>{item.title}</span>}
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground',
                          isOpen && 'rotate-180'
                        )}
                      />
                    )}
                  </button>

                  {/* Dropdown Children */}
                  {sidebarOpen && isOpen && item.children && (
                    <div className="ml-7 space-y-1 border-l border-slate-200 pl-3">
                      {item.children.map((child) => {
                        const isExact = pathname === child.href
                        const hasSiblingMatch = item.children?.some(
                          other => other.href !== child.href && (pathname === other.href || (other.href.length > child.href.length && pathname.startsWith(other.href + '/')))
                        )
                        const isChildActive = isExact || (!hasSiblingMatch && pathname.startsWith(child.href + '/'))
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              'block rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                              isChildActive
                                ? 'text-[#007867] font-semibold bg-[#007867]/5'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-transparent bg-white/80 px-6 backdrop-blur-md">
          {/* Left: Sidebar toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-muted-foreground hover:bg-slate-50 hover:text-foreground shadow-xs transition-colors"
              title="Toggle Sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Pill */}
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <span>US</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* Settings Cog */}
            <Link
              href="/dashboard/settings/account"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* User Avatar with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {userInitials}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {currentUser?.email || 'admin@admin.com'}
                  </p>
                  <span className="mt-1 inline-block rounded-md bg-[#007867]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#007867] uppercase">
                    {activeRole}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/account" className="cursor-pointer text-xs font-medium">
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer text-xs font-medium">
                    <Globe className="mr-2 h-4 w-4" /> Visit Public Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-xs font-medium text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
