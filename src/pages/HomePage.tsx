import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '../components/ui'
import { useLocale, type TranslationKey } from '../lib/i18n'

type InternalTool = {
  kind: 'internal'
  titleKey: TranslationKey
  descKey: TranslationKey
  route: string
}
type ExternalTool = {
  kind: 'external'
  titleKey: TranslationKey
  descKey: TranslationKey
  href: string
}
type Tool = InternalTool | ExternalTool

type Section = {
  id: string
  titleKey: TranslationKey
  items: readonly Tool[]
}

const sections: readonly Section[] = [
  {
    id: 'tools',
    titleKey: 'home.section.tools',
    items: [
      { kind: 'internal', titleKey: 'home.tool.json.title', descKey: 'home.tool.json.desc', route: '/json' },
      { kind: 'internal', titleKey: 'home.tool.jsonEscape.title', descKey: 'home.tool.jsonEscape.desc', route: '/json-escape' },
      { kind: 'internal', titleKey: 'home.tool.yaml.title', descKey: 'home.tool.yaml.desc', route: '/yaml' },
      { kind: 'internal', titleKey: 'home.tool.csharpProto.title', descKey: 'home.tool.csharpProto.desc', route: '/csharp-proto' },
      { kind: 'internal', titleKey: 'home.tool.csharpProtoRemove.title', descKey: 'home.tool.csharpProtoRemove.desc', route: '/csharp-proto-remove' },
      { kind: 'internal', titleKey: 'home.tool.encoder.title', descKey: 'home.tool.encoder.desc', route: '/encoder' },
      { kind: 'internal', titleKey: 'home.tool.diff.title', descKey: 'home.tool.diff.desc', route: '/diff-checker' },
      { kind: 'internal', titleKey: 'home.tool.poco.title', descKey: 'home.tool.poco.desc', route: '/json-to-csharp' },
      { kind: 'internal', titleKey: 'home.tool.sqlPoco.title', descKey: 'home.tool.sqlPoco.desc', route: '/sql-to-csharp' },
      { kind: 'internal', titleKey: 'home.tool.jwt.title', descKey: 'home.tool.jwt.desc', route: '/jwt-decoder' },
    ],
  },
  {
    id: 'dashboards',
    titleKey: 'home.section.dashboards',
    items: [
      { kind: 'external', titleKey: 'home.dash.gold.title', descKey: 'home.dash.gold.desc', href: 'https://gold.nub.io.vn/' },
      { kind: 'external', titleKey: 'home.dash.n8n.title', descKey: 'home.dash.n8n.desc', href: 'https://n8n.nub.io.vn/' },
    ],
  },
]

export default function HomePage() {
  const { t } = useLocale()
  return (
    <div className="mx-auto max-w-content px-[var(--ds-spacing-md)] py-[var(--ds-spacing-xxl)] sm:px-[var(--ds-spacing-xl)] sm:py-[var(--ds-spacing-section)]">
      <header className="mb-[var(--ds-spacing-xxl)] max-w-3xl">
        <h1 className="mt-2 font-display text-display-md font-semibold tracking-tight text-ink sm:text-display-lg">
          {t('home.title')}
        </h1>
        <p className="mt-[var(--ds-spacing-md)] text-body-lg text-ink-muted">
          {t('home.subtitle')}
        </p>
      </header>

      <div className="flex flex-col gap-[var(--ds-spacing-xxl)]">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-[var(--ds-spacing-md)] px-0 font-display text-eyebrow font-medium text-ink-tertiary">
              {t(section.titleKey)}
            </h2>
            <ul className="grid grid-cols-1 gap-[var(--ds-spacing-lg)] sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((tool) => (
                <li key={tool.kind === 'internal' ? tool.route : tool.href}>
                  {tool.kind === 'external' ? (
                    <a
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-lg outline-none focus-visible:ds-focus-ring"
                    >
                      <Card interactive className="relative h-full">
                        <h3 className="font-display text-card-title font-medium text-ink">{t(tool.titleKey)}</h3>
                        <p className="mt-[var(--ds-spacing-sm)] text-body-sm leading-relaxed text-ink-muted">
                          {t(tool.descKey)}
                        </p>
                        <p className="mt-[var(--ds-spacing-lg)] inline-flex items-center gap-2 text-button font-medium text-primary">
                          {t('home.openInNewTab')}
                          <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </p>
                      </Card>
                    </a>
                  ) : (
                    <Link
                      to={tool.route}
                      className="group block rounded-lg outline-none focus-visible:ds-focus-ring"
                    >
                      <Card interactive className="relative h-full">
                        <h3 className="font-display text-card-title font-medium text-ink">
                          {t(tool.titleKey)}
                        </h3>
                        <p className="mt-[var(--ds-spacing-sm)] text-body-sm leading-relaxed text-ink-muted">
                          {t(tool.descKey)}
                        </p>
                        <p className="mt-[var(--ds-spacing-lg)] text-button font-medium text-primary">
                          {t('home.openTool')}
                        </p>
                      </Card>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
