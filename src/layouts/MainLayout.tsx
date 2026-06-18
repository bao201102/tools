import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Maximize2, Minimize2, Braces, GitCompare, KeyRound, Code2, FileText, AlignLeft, Sigma,
  ArrowLeftRight, FileCode2, Table2, Sheet, Lock, Cpu, Database, Wrench,
  Coins, Monitor, Workflow, ExternalLink, ChevronRight,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useLocale, type Locale, type TranslationKey } from '../lib/i18n'
import {
  isUpdateAvailable,
  reloadForUpdate,
  subscribeToUpdates,
} from '../lib/versionCheck'
import { ThemeSwitcher } from '../components/ThemeSwitcher'

type NavInternalItem = { kind: 'internal'; to: string; labelKey: TranslationKey; end?: boolean }
type NavExternalItem = { kind: 'external'; href: string; labelKey: TranslationKey }

type NavInternalItemWithIcon = NavInternalItem & { icon: React.ComponentType<{ className?: string }> }
type NavExternalItemWithIcon = NavExternalItem & { icon: React.ComponentType<{ className?: string }> }
type NavItemWithIcon = NavInternalItemWithIcon | NavExternalItemWithIcon
type NavGroupWithIcon = { id: string; labelKey?: TranslationKey; items: NavItemWithIcon[] }

const navGroups: NavGroupWithIcon[] = [
  {
    id: 'tools',
    labelKey: 'nav.group.tools',
    items: [
      { kind: 'internal', to: '/json', labelKey: 'nav.item.jsonFormatter', icon: Braces },
      { kind: 'internal', to: '/diff-checker', labelKey: 'nav.item.diffChecker', icon: GitCompare },
      { kind: 'internal', to: '/jwt-decoder', labelKey: 'nav.item.jwtDecoder', icon: KeyRound },
      { kind: 'internal', to: '/json-escape', labelKey: 'nav.item.jsonEscape', icon: Code2 },
      { kind: 'internal', to: '/json-unescape', labelKey: 'nav.item.jsonUnescape', icon: FileCode2 },
      { kind: 'internal', to: '/markdown-preview', labelKey: 'nav.item.markdownPreview', icon: FileText },
      { kind: 'internal', to: '/letter-count', labelKey: 'nav.item.letterCount', icon: Sigma },
    ],
  },
  {
    id: 'convert',
    labelKey: 'nav.group.convert',
    items: [
      { kind: 'internal', to: '/json-to-yaml', labelKey: 'nav.item.yamlFormatter', icon: AlignLeft },
      { kind: 'internal', to: '/yaml-to-json', labelKey: 'nav.item.yamlToJson', icon: ArrowLeftRight },
      { kind: 'internal', to: '/json-to-csv', labelKey: 'nav.item.jsonToCsv', icon: Table2 },
      { kind: 'internal', to: '/csv-to-json', labelKey: 'nav.item.csvToJson', icon: Database },
      { kind: 'internal', to: '/json-to-excel', labelKey: 'nav.item.jsonToExcel', icon: Sheet },
      { kind: 'internal', to: '/excel-to-json', labelKey: 'nav.item.excelToJson', icon: Sheet },
      { kind: 'internal', to: '/encoder', labelKey: 'nav.item.encoder', icon: Lock },
      { kind: 'internal', to: '/json-to-csharp', labelKey: 'nav.item.jsonToCsharp', icon: Cpu },
      { kind: 'internal', to: '/sql-to-csharp', labelKey: 'nav.item.sqlToCsharp', icon: Database },
      { kind: 'internal', to: '/csharp-proto', labelKey: 'nav.item.csharpProto', icon: Wrench },
      { kind: 'internal', to: '/csharp-proto-remove', labelKey: 'nav.item.csharpProtoRemove', icon: Wrench },
    ],
  },
  {
    id: 'utility',
    labelKey: 'nav.group.utility',
    items: [
      { kind: 'external', href: 'https://gold.nub.io.vn/', labelKey: 'nav.item.goldPrice', icon: Coins },
      { kind: 'external', href: 'https://vps-monitoring.nub.io.vn/', labelKey: 'nav.item.vpsMonitoring', icon: Monitor },
      { kind: 'external', href: 'https://n8n.nub.io.vn/', labelKey: 'nav.item.n8n', icon: Workflow },
    ],
  },
]

function LogoMark() {
  return (
    <img
      src="/favicon.png"
      alt="NUB Portal"
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 rounded-lg object-cover opacity-95"
      decoding="async"
    />
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "h-6 w-6 text-ink transition-transform duration-300",
        open ? "rotate-90" : "rotate-0"
      )}
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
      className="flex items-center gap-0.5 rounded-md border border-hairline bg-surface-1 p-0.5 shadow-lg backdrop-blur"
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
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-ink-subtle hover:text-ink hover:bg-surface-2'
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
  const { t, locale, setLocale } = useLocale()
  const [navOpen, setNavOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()
  const [updateAvailable, setUpdateAvailable] = useState(isUpdateAvailable)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const lastPathRef = useRef(location.pathname)
  const [isFullWidth, setIsFullWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('isFullWidth')
      return saved !== 'false'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('isFullWidth', String(isFullWidth))
    } catch {
      // Ignore
    }
  }, [isFullWidth])

  useEffect(() => {
    setNavOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

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
    <div className={cn("flex h-dvh w-full flex-col overflow-hidden bg-canvas text-ink", isFullWidth && "layout-full-width")}>
      {/* Top navigation bar - JSONLint style */}
      <header className="sticky top-0 z-30 grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-hairline bg-surface-1/85 backdrop-blur-md px-4 shadow-sm lg:px-6" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 justify-self-start">
          <NavLink to="/" className="flex items-center gap-3 outline-none focus-visible:ds-focus-ring rounded-md">
            <LogoMark />
            <span className="hidden font-display text-lg font-semibold tracking-tight text-ink sm:inline">
              NUB Portal
            </span>
          </NavLink>
        </div>

        {/* Desktop Navigation - centered */}
        <nav className="hidden items-center justify-center gap-1 justify-self-center lg:flex" aria-label="Main">
          {navGroups.map((group) => (
              <div
                key={group.id}
                className="relative"
                data-dropdown
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === group.id ? null : group.id)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                    openDropdown === group.id
                      ? 'bg-surface-2 text-ink'
                      : 'text-ink-subtle hover:bg-surface-2 hover:text-ink',
                    'outline-none focus-visible:ds-focus-ring'
                  )}
                >
                  {t(group.labelKey!)}
                  <svg
                    className={cn(
                      'h-4 w-4 transition-transform',
                      openDropdown === group.id && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {openDropdown === group.id && (
                  <div className="absolute left-1/2 top-full z-50 mt-1 max-h-[min(70vh,24rem)] w-56 -translate-x-1/2 overflow-y-auto rounded-md border border-hairline bg-surface-1 shadow-lg animate-slide-up-fade-center">
                    <div className="py-1">
                      {group.items.map((item) => {
                        if (item.kind === 'external') {
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 text-sm text-ink-subtle hover:bg-surface-2 hover:text-ink"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {t(item.labelKey)}
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
                                'block px-4 py-2 text-sm',
                                isActive
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-ink-subtle hover:bg-surface-2 hover:text-ink'
                              )
                            }
                            onClick={() => setOpenDropdown(null)}
                          >
                            {t(item.labelKey)}
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </nav>

        {/* Right side - Theme, language, GitHub & mobile menu */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 lg:relative lg:right-auto lg:top-auto lg:translate-y-0 lg:justify-self-end">
        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => setIsFullWidth((f) => !f)}
            aria-label={t('nav.fullWidth')}
            title={t('nav.fullWidth')}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-surface-2',
              'text-ink-subtle transition-colors hover:bg-surface-1 hover:text-ink',
              'outline-none focus-visible:ds-focus-ring'
            )}
          >
            {isFullWidth ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <ThemeSwitcher />
          {/* Language Switcher inline */}
          <div
            role="group"
            aria-label={t('lang.label')}
            className="flex items-center gap-0.5 rounded-md border border-hairline bg-surface-2 p-0.5"
          >
            {[
              { value: 'en' as Locale, short: 'EN' },
              { value: 'vi' as Locale, short: 'VI' },
            ].map((opt) => {
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
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-ink-subtle hover:text-ink hover:bg-surface-1'
                  )}
                >
                  {opt.short}
                </button>
              )
            })}
          </div>

          <a
            href="https://github.com/bao201102/tools"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'text-ink-subtle hover:bg-surface-2 hover:text-ink',
              'outline-none focus-visible:ds-focus-ring'
            )}
          >
            <GithubIcon />
            <span className="hidden xl:inline">{t('nav.openSource')}</span>
          </a>
        </div>

        <button
          type="button"
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-1 lg:hidden',
            'text-ink transition-colors hover:border-hairline-strong hover:bg-surface-2',
            'outline-none focus-visible:ds-focus-ring'
          )}
          aria-expanded={navOpen}
          aria-controls="mobile-nav"
          onClick={() => setNavOpen((o) => !o)}
        >
          <span className="sr-only">
            {navOpen ? t('nav.closeNavigation') : t('nav.openNavigation')}
          </span>
          <MenuIcon open={navOpen} />
        </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          navOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setNavOpen(false)}
      />

      {/* Mobile Nav Drawer */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-hairline/60 bg-surface-1 shadow-2xl lg:hidden",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          navOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="relative flex shrink-0 items-center justify-between border-b border-hairline/60 px-5 py-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
          {/* Subtle gradient accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="NUB" width={28} height={28} className="h-7 w-7 rounded-md object-cover" />
            <span className="font-display text-base font-semibold tracking-tight text-ink">NUB Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label={t('nav.closeNavigation')}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-3 outline-none focus-visible:ds-focus-ring"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable nav area */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3" aria-label="Mobile">
          {navGroups.map((group, gi) => (
            <div key={group.id} className={cn('flex flex-col', gi > 0 && 'mt-1')}>
              {group.labelKey && (
                <div className="px-2 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
                  {t(group.labelKey)}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  if (item.kind === 'external') {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-3"
                        onClick={() => setNavOpen(false)}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-2 text-ink-tertiary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="flex-1 truncate">{t(item.labelKey)}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-40" />
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
                          'group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-ink-subtle hover:bg-surface-2 hover:text-ink active:bg-surface-3'
                        )
                      }
                      onClick={() => setNavOpen(false)}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active left indicator */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                          )}
                          <div className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                            isActive
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-hairline bg-surface-2 text-ink-tertiary group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary'
                          )}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 truncate">{t(item.labelKey)}</span>
                          {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary/60" />}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer Footer — Theme & Language */}
        <div className="shrink-0 border-t border-hairline/60 bg-surface-2/50 px-5 py-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-tertiary">{t('theme.label')}</span>
              <ThemeSwitcher />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-tertiary">{t('lang.label')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          <div className="flex min-h-0 h-full flex-1 flex-col overflow-y-auto bg-canvas">
            <Outlet context={{ navOpen }} />
          </div>
        </main>
      </div>



      {showBanner ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed z-50 flex items-center gap-3 rounded-md border border-hairline bg-surface-1 px-4 py-3 shadow-xl',
            'right-4 bottom-[max(1rem,env(safe-area-inset-bottom))]'
          )}
        >
          <span className="text-body-sm text-ink">{t('banner.newVersion')}</span>
          <button
            type="button"
            onClick={() => reloadForUpdate()}
            className={cn(
              'rounded-md border border-hairline bg-primary text-on-primary px-3 py-1 text-body-sm font-medium',
              'transition-colors hover:bg-primary-hover',
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
