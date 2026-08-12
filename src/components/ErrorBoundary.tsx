import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import { Button } from './ui'
import { useLocale } from '../lib/i18n'

type FallbackProps = {
  error: Error
  onRetry: () => void
}

function ErrorFallback({ error, onRetry }: FallbackProps) {
  const { t } = useLocale()

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] w-full items-center justify-center px-4 py-10"
    >
      <div className="w-full max-w-lg rounded-lg border border-hairline bg-surface-1 p-[var(--ds-spacing-lg)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-error-border bg-error-surface text-error-fg">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="font-display text-subhead font-medium text-ink">
            {t('error.title')}
          </h2>
        </div>

        <p className="mt-[var(--ds-spacing-md)] text-body-sm leading-relaxed text-ink-muted">
          {t('error.body')}
        </p>

        <div className="mt-[var(--ds-spacing-lg)] flex flex-wrap gap-2">
          <Button variant="primary" onClick={onRetry}>
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
            {t('error.retry')}
          </Button>
          <Button variant="secondary" onClick={() => { window.location.href = '/' }}>
            <Home className="h-4 w-4 shrink-0" aria-hidden />
            {t('error.home')}
          </Button>
        </div>

        {error.message ? (
          <details className="mt-[var(--ds-spacing-lg)]">
            <summary className="cursor-pointer text-caption text-ink-subtle outline-none focus-visible:ds-focus-ring">
              {t('error.details')}
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded-md border border-hairline bg-surface-2 p-3 font-mono text-mono text-ink-muted">
              {error.message}
            </pre>
          </details>
        ) : null}
      </div>
    </div>
  )
}

type Props = {
  children: ReactNode
  /** Changing this value resets the boundary — pass the route path. */
  resetKey?: string
}

type State = { error: Error | null }

/**
 * Catches render/lifecycle errors from the tool pages so a single broken tool
 * degrades to an inline message instead of white-screening the whole app.
 * Resets automatically when `resetKey` changes (i.e. on navigation).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Tool crashed:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (error) {
      return <ErrorFallback error={error} onRetry={() => this.setState({ error: null })} />
    }
    return this.props.children
  }
}
