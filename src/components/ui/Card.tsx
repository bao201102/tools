import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
  /** Lifts on hover when wrapped by a parent with .group (e.g. home tool links). */
  interactive?: boolean
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>

export function Card({ children, className = '', interactive = false, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-hairline bg-surface-1 p-[var(--ds-spacing-lg)] text-ink shadow-sm',
        'transition-[background-color,border-color,box-shadow] duration-200 ease-out',
        interactive &&
          'group-hover:border-hairline-strong group-hover:bg-surface-2 group-hover:shadow-md',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
