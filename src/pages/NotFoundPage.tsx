import { Link, useLocation } from 'react-router-dom'
import { useLocale } from '../lib/i18n'
import { usePageTitle } from '../lib/usePageTitle'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFoundPage() {
  const { t } = useLocale()
  usePageTitle('page.notFound.title')
  const location = useLocation()
  const [prefix, suffix] = t('page.notFound.pathDesc').split('{path}')

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-error-border bg-error-surface text-error-fg shadow-sm">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <div className="max-w-sm">
        <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-ink">404</h1>
        <p className="text-body font-medium text-ink">
          {t('page.notFound.heading')}
        </p>
        <p className="mt-2 text-body-sm text-ink-muted">
          {prefix}
          <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-xs">{location.pathname}</code>
          {suffix}
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ds-focus-ring"
      >
        <Home className="h-4 w-4" />
        {t('page.notFound.goHome')}
      </Link>
    </div>
  )
}
