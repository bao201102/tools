import { NavLink, Outlet } from 'react-router-dom'

const navItems: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/json', label: 'JSON Formatter' },
  { to: '/yaml', label: 'YAML Formatter' },
]

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-4">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white shadow-sm"
            aria-hidden
          >
            DT
          </div>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            DevTools
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3" aria-label="Main">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-slate-950">
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
