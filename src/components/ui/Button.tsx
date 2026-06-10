import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'

export type ButtonSize = 'sm' | 'md'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-transparent bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-focus shadow-sm hover:shadow-md',
  secondary:
    'border border-hairline bg-surface-1 text-ink hover:border-hairline-strong hover:bg-surface-2 active:bg-surface-3 shadow-sm',
  tertiary:
    'border border-transparent bg-canvas text-ink hover:bg-surface-2 active:bg-surface-3',
  inverse:
    'border border-transparent bg-inverse-canvas text-inverse-ink hover:bg-inverse-surface-1 active:bg-inverse-surface-2 shadow-sm',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 min-h-9 text-xs',
  md: 'px-4 py-2 min-h-10 text-sm',
}

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium tracking-normal transition-colors active:scale-95',
        'outline-none focus-visible:ds-focus-ring disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
