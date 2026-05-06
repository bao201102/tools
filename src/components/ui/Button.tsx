import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'danger'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-focus',
  secondary:
    'border border-hairline bg-surface-1 text-ink hover:border-hairline-strong hover:bg-surface-2 active:bg-surface-2',
  tertiary:
    'border border-transparent bg-canvas text-ink hover:bg-surface-1 active:bg-surface-2',
  inverse:
    'border border-transparent bg-inverse-canvas text-inverse-ink hover:bg-inverse-surface-1 active:bg-inverse-surface-2',
  danger:
    'border border-error-border bg-error-surface text-error-fg hover:bg-error-surface-strong active:bg-error-surface-strong',
}

type ButtonProps = {
  variant?: ButtonVariant
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-3.5 py-2 text-button font-medium tracking-normal transition-colors',
        'outline-none focus-visible:ds-focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
