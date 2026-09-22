import React, { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props extends ComponentProps<typeof Button> {
  containerClass?: string
  shadow?: boolean
  shadowClass?: string
}

export default function ButtonGradientPrimary({
  children,
  className,
  shadow = true,
  shadowClass,
  containerClass,
  ...props
}: Props) {
  return (
    <div className={cn('relative inline-block', containerClass)}>
      {shadow && (
        <div
          className={cn(
            "after:pointer-events-none after:absolute after:top-1/2 after:-left-7 after:h-[84px] after:w-[84px] after:-translate-y-1/2 after:rounded-full after:bg-[#E4CBA8A6] after:blur-[30px] after:content-[''] dark:after:bg-[#e4cba857]",
            shadowClass
          )}
        />
      )}

      <Button
        className={cn(
          'relative z-10 h-auto bg-gradient-to-r from-primary to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white px-5 py-2.5 shadow-none transition-all',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}
