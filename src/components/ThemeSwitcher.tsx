import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import { useLocale } from '../lib/i18n'
import { useTheme, type ThemeContextValue } from '../lib/ThemeProvider'
import type { ThemePreference } from '../lib/theme'

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function triggerIcon(preference: ThemePreference, resolvedScheme: ThemeContextValue['resolvedScheme']) {
  if (preference === 'light') return SunIcon
  if (preference === 'dark') return MoonIcon
  return resolvedScheme === 'dark' ? MoonIcon : SunIcon
}

const options: Array<{ value: ThemePreference; Icon: typeof SunIcon }> = [
  { value: 'light', Icon: SunIcon },
  { value: 'dark', Icon: MoonIcon },
  { value: 'system', Icon: MonitorIcon },
]

export function ThemeSwitcher() {
  const { t } = useLocale()
  const { preference, resolvedScheme, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const TriggerIcon = triggerIcon(preference, resolvedScheme)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative" data-dropdown>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('theme.label')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-2',
          'text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink',
          'outline-none focus-visible:ds-focus-ring'
        )}
      >
        <TriggerIcon className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={t('theme.label')}
          className="absolute right-0 top-full z-50 mt-1 min-w-[10.5rem] overflow-hidden rounded-md border border-hairline bg-surface-1 py-1 shadow-lg"
        >
          {options.map(({ value, Icon }) => {
            const selected = preference === value
            return (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setPreference(value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-sm text-ink-subtle',
                  'transition-colors hover:bg-surface-2 hover:text-ink',
                  'outline-none focus-visible:bg-surface-2 focus-visible:text-ink'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">
                  {value === 'light'
                    ? t('theme.light')
                    : value === 'dark'
                      ? t('theme.dark')
                      : t('theme.system')}
                </span>
                {selected ? <CheckIcon className="h-4 w-4 shrink-0 text-primary" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
