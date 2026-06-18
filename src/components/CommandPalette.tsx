import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ExternalLink } from 'lucide-react'
import { cn } from '../lib/cn'
import { useLocale, type TranslationKey } from '../lib/i18n'

export type PaletteItem = {
  id: string
  labelKey: TranslationKey
  categoryKey: TranslationKey
  icon: React.ComponentType<{ className?: string }>
  kind: 'internal' | 'external'
  to?: string
  href?: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  items: PaletteItem[]
}

const RECENT_KEY = 'commandPalette:recent'
const MAX_RECENT = 5

export default function CommandPalette({ open, onClose, items }: CommandPaletteProps) {
  const { t } = useLocale()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[]
    } catch {
      return []
    }
  })

  const hasQuery = query.trim().length > 0

  const validRecentCount = useMemo(
    () => recentIds.filter(id => items.some(i => i.id === id)).length,
    [recentIds, items]
  )

  const displayed = useMemo(() => {
    if (hasQuery) {
      const q = query.toLowerCase()
      return items.filter(
        item =>
          t(item.labelKey).toLowerCase().includes(q) ||
          t(item.categoryKey).toLowerCase().includes(q)
      )
    }
    return [
      ...items.filter(i => recentIds.includes(i.id)),
      ...items.filter(i => !recentIds.includes(i.id)),
    ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasQuery, query, items, recentIds])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-palette-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      setRecentIds(prev => {
        const next = [item.id, ...prev.filter(id => id !== item.id)].slice(0, MAX_RECENT)
        try {
          localStorage.setItem(RECENT_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
      onClose()
      if (item.kind === 'internal' && item.to) {
        navigate(item.to)
      } else if (item.kind === 'external' && item.href) {
        window.open(item.href, '_blank', 'noopener,noreferrer')
      }
    },
    [navigate, onClose]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, displayed.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (displayed[activeIndex]) handleSelect(displayed[activeIndex])
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
    }
  }

  if (!open) return null

  const showRecentHeader = !hasQuery && validRecentCount > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('command.trigger')}
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] sm:pt-[15vh]"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-xl',
          'rounded-xl border border-hairline bg-surface-1 shadow-2xl',
          'animate-slide-up-fade'
        )}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-ink-tertiary" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder={t('command.placeholder')}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-tertiary outline-none"
          />
          {hasQuery ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-ink-tertiary transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden items-center rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-ink-tertiary sm:flex">
              Esc
            </kbd>
          )}
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto overscroll-contain py-1.5"
          role="listbox"
        >
          {showRecentHeader && (
            <div className="px-4 pb-1 pt-1 text-xs font-semibold uppercase tracking-widest text-ink-tertiary">
              {t('command.recent')}
            </div>
          )}

          {displayed.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-tertiary">
              {t('command.noResults')}
            </div>
          ) : (
            displayed.map((item, idx) => {
              const Icon = item.icon
              const isActive = idx === activeIndex
              const isRecent = !hasQuery && recentIds.includes(item.id) && idx < validRecentCount
              const showDivider = !hasQuery && validRecentCount > 0 && idx === validRecentCount

              return (
                <div key={item.id}>
                  {showDivider && (
                    <div className="mx-4 my-1.5 border-t border-hairline/60" />
                  )}
                  <button
                    data-palette-index={idx}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      isActive ? 'bg-surface-2' : 'hover:bg-surface-2/60'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                        isActive
                          ? 'border-primary/30 bg-primary/10 text-primary'
                          : 'border-hairline bg-surface-2 text-ink-tertiary'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-ink">{t(item.labelKey)}</div>
                      <div className="text-xs text-ink-tertiary">{t(item.categoryKey)}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {isRecent && (
                        <span className="rounded border border-hairline px-1.5 py-0.5 font-medium text-xs text-ink-tertiary">
                          Recent
                        </span>
                      )}
                      {item.kind === 'external' && (
                        <ExternalLink className="h-3 w-3 text-ink-tertiary" />
                      )}
                    </div>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-3 border-t border-hairline px-4 py-2 text-xs text-ink-tertiary">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-hairline bg-surface-2 px-1 py-0.5 font-mono leading-none">
              ↑↓
            </kbd>
            {t('command.hint.navigate')}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-hairline bg-surface-2 px-1 py-0.5 font-mono leading-none">
              ↵
            </kbd>
            {t('command.hint.open')}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <kbd className="rounded border border-hairline bg-surface-2 px-1 py-0.5 font-mono leading-none">
              Esc
            </kbd>
            {t('command.hint.close')}
          </span>
        </div>
      </div>
    </div>
  )
}
