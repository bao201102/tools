import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  FileJson,
  GitCompare,
  Fingerprint,
  Quote,
  Braces,
  RefreshCw,
  Hash,
  Terminal,
  Database,
  Sliders,
  Trash2,
  Coins,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '../components/ui'
import { useLocale, type TranslationKey } from '../lib/i18n'

type InternalTool = {
  kind: 'internal'
  titleKey: TranslationKey
  descKey: TranslationKey
  route: string
  icon: LucideIcon
}
type ExternalTool = {
  kind: 'external'
  titleKey: TranslationKey
  descKey: TranslationKey
  href: string
  icon: LucideIcon
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
      { kind: 'internal', titleKey: 'home.tool.json.title', descKey: 'home.tool.json.desc', route: '/json', icon: FileJson },
      { kind: 'internal', titleKey: 'home.tool.diff.title', descKey: 'home.tool.diff.desc', route: '/diff-checker', icon: GitCompare },
      { kind: 'internal', titleKey: 'home.tool.jwt.title', descKey: 'home.tool.jwt.desc', route: '/jwt-decoder', icon: Fingerprint },
      { kind: 'internal', titleKey: 'home.tool.jsonEscape.title', descKey: 'home.tool.jsonEscape.desc', route: '/json-escape', icon: Quote },
      { kind: 'internal', titleKey: 'home.tool.jsonUnescape.title', descKey: 'home.tool.jsonUnescape.desc', route: '/json-unescape', icon: Braces },
    ],
  },
  {
    id: 'convert',
    titleKey: 'home.section.convert',
    items: [
      { kind: 'internal', titleKey: 'home.tool.yaml.title', descKey: 'home.tool.yaml.desc', route: '/json-to-yaml', icon: RefreshCw },
      { kind: 'internal', titleKey: 'home.tool.encoder.title', descKey: 'home.tool.encoder.desc', route: '/encoder', icon: Hash },
      { kind: 'internal', titleKey: 'home.tool.poco.title', descKey: 'home.tool.poco.desc', route: '/json-to-csharp', icon: Terminal },
      { kind: 'internal', titleKey: 'home.tool.sqlPoco.title', descKey: 'home.tool.sqlPoco.desc', route: '/sql-to-csharp', icon: Database },
      { kind: 'internal', titleKey: 'home.tool.csharpProto.title', descKey: 'home.tool.csharpProto.desc', route: '/csharp-proto', icon: Sliders },
      { kind: 'internal', titleKey: 'home.tool.csharpProtoRemove.title', descKey: 'home.tool.csharpProtoRemove.desc', route: '/csharp-proto-remove', icon: Trash2 },
    ],
  },
  {
    id: 'utility',
    titleKey: 'nav.group.utility',
    items: [
      { kind: 'external', titleKey: 'home.dash.gold.title', descKey: 'home.dash.gold.desc', href: 'https://gold.nub.io.vn/', icon: Coins },
      { kind: 'external', titleKey: 'home.dash.n8n.title', descKey: 'home.dash.n8n.desc', href: 'https://n8n.nub.io.vn/', icon: Workflow },
    ],
  },
]

export default function HomePage() {
  const { t } = useLocale()
  return (
    <div className="relative min-h-full w-full overflow-x-hidden bg-canvas">
      {/* Ambient Glows */}
      <div className="ambient-glow -left-20 -top-20 opacity-70 dark:opacity-80" />
      <div className="ambient-glow right-1/4 bottom-1/4 opacity-30 dark:opacity-40" />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-content px-[var(--ds-spacing-md)] py-[var(--ds-spacing-xxl)] sm:px-[var(--ds-spacing-xl)] sm:py-[var(--ds-spacing-section)]">
        <header className="mb-[var(--ds-spacing-xxl)] max-w-3xl">
          <h1 className="mt-2 font-display text-display-md font-semibold tracking-tight text-ink sm:text-display-lg bg-gradient-to-r from-ink via-ink to-ink-subtle bg-clip-text text-transparent">
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
                        className="group block rounded-lg outline-none focus-visible:ds-focus-ring h-full"
                      >
                        <Card interactive className="relative h-full flex flex-col justify-between min-h-[160px]">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-2 text-primary group-hover:bg-primary group-hover:text-on-primary group-hover:border-transparent transition-all duration-300">
                                <tool.icon className="h-5 w-5" />
                              </div>
                              <h3 className="font-display text-card-title font-medium text-ink transition-colors group-hover:text-primary">
                                {t(tool.titleKey)}
                              </h3>
                            </div>
                            <p className="mt-[var(--ds-spacing-md)] text-body-sm leading-relaxed text-ink-muted">
                              {t(tool.descKey)}
                            </p>
                          </div>
                          <p className="mt-[var(--ds-spacing-lg)] inline-flex items-center gap-1.5 text-button font-medium text-primary">
                            {t('home.openInNewTab')}
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                          </p>
                        </Card>
                      </a>
                    ) : (
                      <Link
                        to={tool.route}
                        className="group block rounded-lg outline-none focus-visible:ds-focus-ring h-full"
                      >
                        <Card interactive className="relative h-full flex flex-col justify-between min-h-[160px]">
                          <div>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-surface-2 text-primary group-hover:bg-primary group-hover:text-on-primary group-hover:border-transparent transition-all duration-300">
                                <tool.icon className="h-5 w-5" />
                              </div>
                              <h3 className="font-display text-card-title font-medium text-ink transition-colors group-hover:text-primary">
                                {t(tool.titleKey)}
                              </h3>
                            </div>
                            <p className="mt-[var(--ds-spacing-md)] text-body-sm leading-relaxed text-ink-muted">
                              {t(tool.descKey)}
                            </p>
                          </div>
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
    </div>
  )
}
