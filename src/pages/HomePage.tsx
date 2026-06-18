import { useEffect, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowUp,
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
  FileText,
  Server,
  CaseSensitive,
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
      { kind: 'internal', titleKey: 'home.tool.markdownPreview.title', descKey: 'home.tool.markdownPreview.desc', route: '/markdown-preview', icon: FileText },
      { kind: 'internal', titleKey: 'home.tool.letterCount.title', descKey: 'home.tool.letterCount.desc', route: '/letter-count', icon: CaseSensitive },
    ],
  },
  {
    id: 'convert',
    titleKey: 'home.section.convert',
    items: [
      { kind: 'internal', titleKey: 'home.tool.yaml.title', descKey: 'home.tool.yaml.desc', route: '/json-to-yaml', icon: RefreshCw },
      { kind: 'internal', titleKey: 'home.tool.yamlToJson.title', descKey: 'home.tool.yamlToJson.desc', route: '/yaml-to-json', icon: FileJson },
      { kind: 'internal', titleKey: 'home.tool.jsonToCsv.title', descKey: 'home.tool.jsonToCsv.desc', route: '/json-to-csv', icon: FileText },
      { kind: 'internal', titleKey: 'home.tool.csvToJson.title', descKey: 'home.tool.csvToJson.desc', route: '/csv-to-json', icon: FileJson },
      { kind: 'internal', titleKey: 'home.tool.jsonToExcel.title', descKey: 'home.tool.jsonToExcel.desc', route: '/json-to-excel', icon: FileText },
      { kind: 'internal', titleKey: 'home.tool.excelToJson.title', descKey: 'home.tool.excelToJson.desc', route: '/excel-to-json', icon: FileJson },
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
      { kind: 'external', titleKey: 'home.dash.vps.title', descKey: 'home.dash.vps.desc', href: 'https://vps-monitoring.nub.io.vn/', icon: Server },
      { kind: 'external', titleKey: 'home.dash.n8n.title', descKey: 'home.dash.n8n.desc', href: 'https://n8n.nub.io.vn/', icon: Workflow },
    ],
  },
]

export default function HomePage() {
  const { t } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const context = useOutletContext<{ navOpen?: boolean }>()
  const isNavOpen = context?.navOpen ?? false

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target) return
      
      const scrollTop = target.scrollTop !== undefined 
        ? target.scrollTop 
        : (document.documentElement?.scrollTop || window.scrollY || 0)
      if (scrollTop > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    // Capture all scroll events in the capture phase (since scroll events don't bubble)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [])

  const scrollToTop = () => {
    const topElement = document.getElementById('home-page-top')
    if (topElement) {
      topElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else {
      const scrollableContainer = containerRef.current?.closest('.overflow-y-auto') || document.querySelector('.overflow-y-auto')
      if (scrollableContainer) {
        scrollableContainer.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    }
  }

  return (
    <div ref={containerRef} className="relative min-h-full w-full overflow-x-hidden bg-canvas">
      <div id="home-page-top" className="absolute top-0 left-0 pointer-events-none" />
      {/* Ambient Glows */}
      <div className="ambient-glow -left-20 -top-20 opacity-70 dark:opacity-80" />
      <div className="ambient-glow right-1/4 bottom-1/4 opacity-30 dark:opacity-40" />

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-content px-4 py-10 sm:px-[var(--ds-spacing-xl)] sm:py-[var(--ds-spacing-section)]">
        <header className="mb-8 sm:mb-[var(--ds-spacing-xxl)] max-w-3xl">
          <h1 className="mt-2 font-display text-headline sm:text-display-md font-semibold tracking-tight text-ink sm:text-display-lg bg-gradient-to-r from-ink via-ink to-ink-subtle bg-clip-text text-transparent">
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
              <ul className="grid grid-cols-2 gap-3 min-[480px]:gap-[var(--ds-spacing-lg)] sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
                {section.items.map((tool) => (
                  <li key={tool.kind === 'internal' ? tool.route : tool.href}>
                    {tool.kind === 'external' ? (
                      <a
                         href={tool.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg outline-none focus-visible:ds-focus-ring h-full"
                      >
                        <Card interactive className="relative h-full flex flex-col justify-between min-h-[120px] sm:min-h-[160px]">
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
                        <Card interactive className="relative h-full flex flex-col justify-between min-h-[120px] sm:min-h-[160px]">
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
                            {t('home.useTool')}
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
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

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface-1/80 text-ink shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-primary hover:text-white hover:border-transparent hover:scale-110 active:scale-95 ${
          showScrollTop && !isNavOpen
            ? 'pointer-events-auto opacity-100 translate-y-0'
            : 'pointer-events-none opacity-0 translate-y-4'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}
