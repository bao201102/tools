import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type InputProps = {
  error?: boolean
  className?: string
} & InputHTMLAttributes<HTMLInputElement>

export function Input({ error = false, className = '', ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'w-full min-h-11 rounded-md border bg-surface-1 px-3 py-2 text-body text-ink',
        'placeholder:text-ink-tertiary',
        'outline-none transition-colors focus-visible:ds-focus-ring',
        error
          ? 'border-error-border bg-error-surface/80'
          : 'border-hairline hover:border-hairline-strong focus:border-hairline-strong',
        className
      )}
      {...rest}
    />
  )
}
