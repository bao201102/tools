import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

const navItems: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/json', label: 'JSON Formatter' },
  { to: '/json-escape', label: 'JSON Escape / Unescape' },
  { to: '/yaml', label: 'YAML Formatter' },
  { to: '/csharp-proto', label: 'C# ProtoMember' },
  { to: '/encoder', label: 'Encoder / Decoder' },
  { to: '/diff-checker', label: 'Text & Code Diff' },
  { to: '/json-to-csharp', label: 'JSON -> C# POCO' },
  { to: '/jwt-decoder', label: 'JWT Decoder' },
]

function LogoMark() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800 ring-1 ring-slate-700"
      aria-hidden
    >
      <img
        src="/favicon.svg"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 object-contain"
        decoding="async"
      />
    </div>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6 text-slate-200"
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

export default function MainLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const location = useLocation()

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
    <div className="flex min-h-[100dvh] min-h-screen flex-col overflow-x-hidden bg-slate-950 text-slate-100 md:flex-row">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-900 px-3 pt-[env(safe-area-inset-top)] md:hidden">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-600"
          aria-expanded={navOpen}
          aria-controls="site-nav"
          onClick={() => setNavOpen((o) => !o)}
        >
          <span className="sr-only">{navOpen ? 'Close navigation' : 'Open navigation'}</span>
          <MenuIcon open={navOpen} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <LogoMark />
          <span className="truncate text-sm font-semibold tracking-tight text-slate-100">
            DevTools
          </span>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col md:min-h-[100dvh] md:flex-row">
        {navOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-[2px] md:hidden"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
        ) : null}

        <aside
          id="site-nav"
          className={[
            'fixed bottom-0 left-0 top-0 z-50 flex w-[min(17.5rem,88vw)] max-w-[100vw] flex-col border-r border-slate-800 bg-slate-900',
            'transition-transform duration-200 ease-out will-change-transform',
            'md:static md:z-auto md:max-w-none md:translate-x-0 md:transition-none',
            navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
            <span className="text-sm font-semibold text-slate-200">Menu</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <MenuIcon open />
            </button>
          </div>
          <div className="hidden h-16 items-center gap-3 border-b border-slate-800 px-4 md:flex">
            <LogoMark />
            <span className="text-sm font-semibold tracking-tight text-slate-100">DevTools</span>
          </div>
          <nav className="flex flex-col gap-0.5 overflow-y-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" aria-label="Main">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors md:py-2',
                    isActive
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-950 pb-[env(safe-area-inset-bottom)]">
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
