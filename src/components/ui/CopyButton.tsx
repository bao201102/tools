import { Check, Copy, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useLocale } from '../../lib/i18n'
import { useCopyToClipboard } from '../../lib/useCopyToClipboard'
import { Button, type ButtonVariant, type ButtonSize } from './Button'

type CopyButtonProps = {
  /** Text to copy, or a getter resolved at click time. */
  value: string | (() => string)
  /** Optional custom label for the idle state (defaults to common.copy). */
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  disabled?: boolean
  /** Hide the leading icon (text-only). */
  hideIcon?: boolean
}

/**
 * Copy-to-clipboard button with built-in success/failure feedback.
 * Replaces the per-tool `copyState` + setTimeout boilerplate so every tool
 * gives the same visual confirmation.
 */
export function CopyButton({
  value,
  label,
  variant = 'secondary',
  size = 'sm',
  className,
  disabled,
  hideIcon = false,
}: CopyButtonProps) {
  const { t } = useLocale()
  const { state, copy } = useCopyToClipboard()

  const resolved = () => (typeof value === 'function' ? value() : value)
  const isEmpty = !resolved()

  const text =
    state === 'copied'
      ? t('common.copied')
      : state === 'failed'
        ? t('common.failed')
        : label ?? t('common.copy')

  const Icon = state === 'copied' ? Check : state === 'failed' ? X : Copy

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isEmpty}
      onClick={() => copy(resolved())}
      aria-label={text}
      className={cn(
        state === 'copied' && 'text-semantic-success',
        state === 'failed' && 'text-error-fg',
        className
      )}
    >
      {!hideIcon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {text}
    </Button>
  )
}
