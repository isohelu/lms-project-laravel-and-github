'use client'

import React, { useRef } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  className?: string
  iconPosition?: 'left' | 'right'
  placeholder?: string
  onChangeValue?: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  change?: boolean
  defaultValue?: string
}

export default function SearchInput({
  className,
  iconPosition = 'left',
  placeholder = 'Search',
  onChangeValue,
  onKeyDown,
  change = false,
  defaultValue = '',
}: SearchInputProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <div className={cn('relative w-full md:max-w-[260px]', className)}>
      <input
        type="text"
        ref={searchRef}
        defaultValue={defaultValue}
        onChange={(e) => onChangeValue && onChangeValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full min-w-0 rounded-lg border border-input bg-transparent py-[15px] text-sm font-normal text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          change
            ? 'selection:bg-primary selection:text-primary-foreground hover:border-ring focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring'
            : 'selection:bg-zinc-900 selection:text-zinc-50 hover:border-zinc-900 focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:selection:bg-zinc-50 dark:selection:text-zinc-900 dark:hover:border-zinc-50 dark:focus-visible:border-zinc-50 dark:focus-visible:ring-zinc-50',
          iconPosition === 'left' ? 'pr-4 pl-10' : 'pr-10 pl-4'
        )}
      />

      <Search
        className={cn(
          'absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none',
          iconPosition === 'left' ? 'left-3.5' : 'right-3.5'
        )}
      />
    </div>
  )
}
