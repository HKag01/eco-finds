import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'rounded-full bg-primary flex items-center justify-center',
        sizeClasses[size]
      )}>
        <span className="text-primary-foreground font-bold text-sm">E</span>
      </div>
      <span className={cn(
        'font-bold text-foreground',
        textSizeClasses[size]
      )}>
        EcoFinds
      </span>
    </div>
  )
}