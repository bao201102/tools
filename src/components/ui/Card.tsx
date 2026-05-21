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
        'transition-all duration-200 ease-out',
        interactive &&
          'hover:border-primary/45 group-hover:border-primary/45 group-hover:-translate-y-1 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] group-hover:dark:shadow-[0_8px_30px_rgba(94,106,210,0.24)] active:scale-[0.98] group-active:scale-[0.98] active:translate-y-0 group-active:translate-y-0 active:shadow-sm group-active:shadow-sm',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
