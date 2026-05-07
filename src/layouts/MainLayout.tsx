import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'

type NavInternalItem = { kind: 'internal'; to: string; label: string; end?: boolean }
type NavExternalItem = { kind: 'external'; href: string; label: string }
type NavItem = NavInternalItem | NavExternalItem

type NavGroup = { id: string; label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    id: 'home',
    label: '',
    items: [{ kind: 'internal', to: '/', label: 'Home', end: true }],
  },
  {
    id: 'tools',
    label: 'Developer Tools',
    items: [
      { kind: 'internal', to: '/json', label: 'JSON Formatter' },
      { kind: 'internal', to: '/json-escape', label: 'JSON Escape / Unescape' },
      { kind: 'internal', to: '/yaml', label: 'YAML Formatter' },
      { kind: 'internal', to: '/csharp-proto', label: 'C# ProtoMember' },
      { kind: 'internal', to: '/encoder', label: 'Encoder / Decoder' },
      { kind: 'internal', to: '/diff-checker', label: 'Text & Code Diff' },
      { kind: 'internal', to: '/json-to-csharp', label: 'JSON → C# POCO' },
      { kind: 'internal', to: '/sql-to-csharp', label: 'SQL Table → C# POCO' },
      { kind: 'internal', to: '/jwt-decoder', label: 'JWT Decoder' },
    ],
  },
  {
    id: 'dashboards',
    label: 'Dashboards & Services',
    items: [
      { kind: 'external', href: 'https://gold.nub.io.vn/', label: 'Gold Price Tracker' },
      { kind: 'external', href: 'https://n8n.nub.io.vn/', label: 'n8n Dashboard' },
    ],
  },
]

function LogoMark() {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-hairline bg-surface-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
      aria-hidden
    >
      <img
        src="/favicon.svg"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 object-contain opacity-95"
        decoding="async"
      />
    </div>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6 text-ink"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      className="h-4 w-4 text-ink-tertiary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  )
}

export default function MainLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.filter((g) => g.label).map((g) => [g.id, true]))
  )

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas text-ink md:flex-row">
      {/* Mobile top bar — canvas + hairline (DESIGN top-nav density) */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-hairline bg-canvas/95 px-[var(--ds-spacing-md)] pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden">
        <button
          type="button"
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-1',
            'text-ink transition-colors hover:border-hairline-strong hover:bg-surface-2 active:bg-surface-2',
            'outline-none focus-visible:ds-focus-ring'
          )}
          aria-expanded={navOpen}
          aria-controls="site-nav"
          onClick={() => setNavOpen((o) => !o)}
        >
          <span className="sr-only">{navOpen ? 'Close navigation' : 'Open navigation'}</span>
          <MenuIcon open={navOpen} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold tracking-tight text-ink">NUB Portal</p>
            <p className="truncate text-caption text-ink-subtle">Your workspace hub</p>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {navOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-semantic-overlay backdrop-blur-[1px] md:hidden"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
        ) : null}

        <aside
          id="site-nav"
          className={cn(
            'fixed bottom-0 left-0 top-0 z-50 flex h-full w-[min(19rem,92vw)] max-w-[100vw] flex-shrink-0 flex-col overflow-y-auto border-r border-hairline bg-surface-3',
            'shadow-[inset_1px_0_0_0_rgba(255,255,255,0.04)]',
            'transition-transform duration-200 ease-out will-change-transform',
            'md:static md:z-auto md:h-full md:min-h-0 md:w-64 md:max-w-none md:translate-x-0 md:shadow-none md:transition-none',
            navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          <div className="flex items-center justify-between border-b border-hairline px-[var(--ds-spacing-md)] py-[var(--ds-spacing-md)] pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
            <span className="font-display text-sm font-semibold text-ink">Menu</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-4 hover:text-ink outline-none focus-visible:ds-focus-ring"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <MenuIcon open />
            </button>
          </div>

          <div className="hidden border-b border-hairline px-[var(--ds-spacing-lg)] pb-[var(--ds-spacing-md)] pt-[var(--ds-spacing-xl)] md:block">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold tracking-tight text-ink">NUB Portal</p>
                <p className="text-caption text-ink-subtle">Your workspace hub</p>
              </div>
            </div>
          </div>

          <nav
            className="flex flex-col gap-1 px-[var(--ds-spacing-sm)] py-[var(--ds-spacing-md)] pb-[max(var(--ds-spacing-lg),env(safe-area-inset-bottom))]"
            aria-label="Main"
          >
            {navGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1">
                {group.label ? (
                  <button
                    type="button"
                    className={cn(
                      'mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left font-display text-eyebrow font-medium text-ink-tertiary transition-colors',
                      'hover:bg-surface-2/60 hover:text-ink',
                      'outline-none focus-visible:ds-focus-ring'
                    )}
                    aria-expanded={expandedGroups[group.id] ?? true}
                    aria-controls={`nav-group-${group.id}`}
                    onClick={() =>
                      setExpandedGroups((prev) => ({
                        ...prev,
                        [group.id]: !(prev[group.id] ?? true),
                      }))
                    }
                  >
                    {expandedGroups[group.id] ?? true ? (
                      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    <span className="min-w-0 truncate">{group.label}</span>
                  </button>
                ) : null}

                <div
                  id={`nav-group-${group.id}`}
                  className={cn(
                    'overflow-hidden transition-[max-height] duration-200 ease-out',
                    group.label && !(expandedGroups[group.id] ?? true) ? 'max-h-0' : 'max-h-[1000px]'
                  )}
                >
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const itemClassName = cn(
                        'rounded-md px-3 py-2.5 text-body-sm font-medium transition-colors md:py-2',
                        'outline-none focus-visible:ds-focus-ring',
                        'text-ink-subtle hover:bg-surface-2/90 hover:text-ink'
                      )

                      if (item.kind === 'external') {
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={itemClassName}
                          >
                            <span className="inline-flex items-center gap-2">
                              {item.label}
                              <ExternalLinkIcon />
                            </span>
                          </a>
                        )
                      }

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            cn(
                              itemClassName,
                              isActive
                                ? 'bg-surface-2 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                                : undefined
                            )
                          }
                        >
                          {item.label}
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto hidden border-t border-hairline px-[var(--ds-spacing-lg)] py-[var(--ds-spacing-md)] md:block">
            <p className="text-caption leading-relaxed text-ink-tertiary">
              All processing stays in your browser.
            </p>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          <div className="flex min-h-0 h-full flex-1 flex-col overflow-y-auto bg-canvas">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
