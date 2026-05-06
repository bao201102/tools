import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type TextareaProps = {
  error?: boolean
  className?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ error = false, className = '', ...rest }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full min-h-24 rounded-md border bg-surface-1 px-3 py-2 text-body text-ink',
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
