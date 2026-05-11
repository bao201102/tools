import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { useLocale, type Locale, type TranslationKey } from '../lib/i18n'
import {
  isUpdateAvailable,
  reloadForUpdate,
  subscribeToUpdates,
} from '../lib/versionCheck'

type NavInternalItem = { kind: 'internal'; to: string; labelKey: TranslationKey; end?: boolean }
type NavExternalItem = { kind: 'external'; href: string; labelKey: TranslationKey }
type NavItem = NavInternalItem | NavExternalItem

type NavGroup = { id: string; labelKey?: TranslationKey; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    id: 'home',
    items: [{ kind: 'internal', to: '/', labelKey: 'nav.item.home', end: true }],
  },
  {
    id: 'tools',
    labelKey: 'nav.group.devTools',
    items: [
      { kind: 'internal', to: '/json', labelKey: 'nav.item.jsonFormatter' },
      { kind: 'internal', to: '/json-escape', labelKey: 'nav.item.jsonEscape' },
      { kind: 'internal', to: '/yaml', labelKey: 'nav.item.yamlFormatter' },
      { kind: 'internal', to: '/csharp-proto', labelKey: 'nav.item.csharpProto' },
      { kind: 'internal', to: '/csharp-proto-remove', labelKey: 'nav.item.csharpProtoRemove' },
      { kind: 'internal', to: '/encoder', labelKey: 'nav.item.encoder' },
      { kind: 'internal', to: '/diff-checker', labelKey: 'nav.item.diffChecker' },
      { kind: 'internal', to: '/json-to-csharp', labelKey: 'nav.item.jsonToCsharp' },
      { kind: 'internal', to: '/sql-to-csharp', labelKey: 'nav.item.sqlToCsharp' },
      { kind: 'internal', to: '/jwt-decoder', labelKey: 'nav.item.jwtDecoder' },
    ],
  },
  {
    id: 'dashboards',
    labelKey: 'nav.group.dashboards',
    items: [
      { kind: 'external', href: 'https://gold.nub.io.vn/', labelKey: 'nav.item.goldPrice' },
      { kind: 'external', href: 'https://n8n.nub.io.vn/', labelKey: 'nav.item.n8n' },
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

function GithubIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale()
  const options: Array<{ value: Locale; short: string }> = [
    { value: 'en', short: 'EN' },
    { value: 'vi', short: 'VI' },
  ]
  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className={cn(
        'fixed z-[60] flex items-center gap-0.5 rounded-md border border-hairline bg-surface-3/95 p-0.5 shadow-md backdrop-blur',
        'right-3 top-[max(0.5rem,env(safe-area-inset-top))] md:right-4 md:top-3'
      )}
    >
      {options.map((opt) => {
        const active = locale === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            aria-pressed={active}
            aria-label={opt.value === 'en' ? t('lang.english') : t('lang.vietnamese')}
            className={cn(
              'rounded px-2 py-1 text-caption font-medium transition-colors',
              'outline-none focus-visible:ds-focus-ring',
              active
                ? 'bg-surface-1 text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
                : 'text-ink-subtle hover:text-ink'
            )}
          >
            {opt.short}
          </button>
        )
      })}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function MainLayout() {
  const { t } = useLocale()
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navGroups.filter((g) => g.labelKey).map((g) => [g.id, true]))
  )
  const [updateAvailable, setUpdateAvailable] = useState(isUpdateAvailable)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const lastPathRef = useRef(location.pathname)

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

  useEffect(() => {
    return subscribeToUpdates(() => {
      setUpdateAvailable(isUpdateAvailable())
      setBannerDismissed(false)
    })
  }, [])

  // Auto-reload on route change when a new build is pending. Route change is
  // treated as a safe boundary — the current page is being left anyway.
  useEffect(() => {
    if (location.pathname === lastPathRef.current) return
    lastPathRef.current = location.pathname
    if (updateAvailable) {
      reloadForUpdate()
    }
  }, [location.pathname, updateAvailable])

  const showBanner = updateAvailable && !bannerDismissed

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
          <span className="sr-only">
            {navOpen ? t('nav.closeNavigation') : t('nav.openNavigation')}
          </span>
          <MenuIcon open={navOpen} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3 pr-20">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold tracking-tight text-ink">NUB Portal</p>
            <p className="truncate text-caption text-ink-subtle">{t('nav.workspaceHub')}</p>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {navOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-semantic-overlay backdrop-blur-[1px] md:hidden"
            aria-label={t('nav.closeNavigation')}
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
            <span className="font-display text-sm font-semibold text-ink">{t('nav.menu')}</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-4 hover:text-ink outline-none focus-visible:ds-focus-ring"
              onClick={() => setNavOpen(false)}
              aria-label={t('nav.closeNavigation')}
            >
              <MenuIcon open />
            </button>
          </div>

          <div className="hidden border-b border-hairline px-[var(--ds-spacing-lg)] pb-[var(--ds-spacing-md)] pt-[var(--ds-spacing-xl)] md:block">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold tracking-tight text-ink">NUB Portal</p>
                <p className="text-caption text-ink-subtle">{t('nav.workspaceHub')}</p>
              </div>
            </div>
          </div>

          <nav
            className="flex flex-col gap-1 px-[var(--ds-spacing-sm)] py-[var(--ds-spacing-md)]"
            aria-label="Main"
          >
            {navGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1">
                {group.labelKey ? (
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
                    <span className="min-w-0 truncate">{t(group.labelKey)}</span>
                  </button>
                ) : null}

                <div
                  id={`nav-group-${group.id}`}
                  className={cn(
                    'overflow-hidden transition-[max-height] duration-200 ease-out',
                    group.labelKey && !(expandedGroups[group.id] ?? true) ? 'max-h-0' : 'max-h-[1000px]'
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
                              {t(item.labelKey)}
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
                          {t(item.labelKey)}
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto border-t border-surface-3 px-[var(--ds-spacing-sm)] py-3 pb-[max(var(--ds-spacing-md),env(safe-area-inset-bottom))]">
            <a
              href="https://github.com/bao201102/tools"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-3 text-body-sm font-medium transition-colors',
                'text-ink-subtle hover:bg-surface-2/90 hover:text-ink',
                'outline-none focus-visible:ds-focus-ring'
              )}
            >
              <GithubIcon />
              <span>{t('nav.openSource')}</span>
            </a>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          <div className="flex min-h-0 h-full flex-1 flex-col overflow-y-auto bg-canvas">
            <Outlet />
          </div>
        </main>
      </div>

      <LanguageSwitcher />

      {showBanner ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed z-50 flex items-center gap-3 rounded-md border border-hairline bg-surface-3 px-4 py-3 shadow-xl',
            'right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]'
          )}
        >
          <span className="text-body-sm text-ink">{t('banner.newVersion')}</span>
          <button
            type="button"
            onClick={() => reloadForUpdate()}
            className={cn(
              'rounded-md border border-hairline bg-surface-1 px-3 py-1 text-body-sm font-medium text-ink',
              'transition-colors hover:border-hairline-strong hover:bg-surface-2',
              'outline-none focus-visible:ds-focus-ring'
            )}
          >
            {t('banner.reload')}
          </button>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label={t('banner.dismiss')}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle',
              'transition-colors hover:bg-surface-2 hover:text-ink',
              'outline-none focus-visible:ds-focus-ring'
            )}
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}
    </div>
  )
}
