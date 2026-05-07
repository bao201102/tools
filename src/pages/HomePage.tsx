import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Card } from '../components/ui'

const sections = [
  {
    id: 'tools',
    title: 'Developer Tools',
    items: [
      {
        kind: 'internal',
        title: 'JSON Formatter',
        description: 'Pretty-print as you type; minify to one line on demand',
        route: '/json',
      },
      {
        kind: 'internal',
        title: 'JSON Escaper & Unescaper',
        description:
          'Convert escaped string payloads ↔ pretty JSON — bidirectional realtime with smart unwrap.',
        route: '/json-escape',
      },
      {
        kind: 'internal',
        title: 'YAML Formatter',
        description: 'Normalize and validate YAML as you type',
        route: '/yaml',
      },
      {
        kind: 'internal',
        title: 'C# ProtoMember Reindex',
        description: 'Re-sequence [ProtoMember] attributes on C# properties',
        route: '/csharp-proto',
      },
      {
        kind: 'internal',
        title: 'Base64 / URL Encoder & Decoder',
        description: 'Encode and decode Base64 or URL-encoded text',
        route: '/encoder',
      },
      {
        kind: 'internal',
        title: 'Text & Code Diff Checker',
        description: 'Compare Original vs Modified with side-by-side or inline Monaco diff',
        route: '/diff-checker',
      },
      {
        kind: 'internal',
        title: 'JSON to C# POCO Generator',
        description: 'Generate C# class definitions from JSON input',
        route: '/json-to-csharp',
      },
      {
        kind: 'internal',
        title: 'SQL Table to C# POCO Generator',
        description: 'Parse CREATE TABLE scripts and generate nullable-safe C# POCO properties',
        route: '/sql-to-csharp',
      },
      {
        kind: 'internal',
        title: 'JWT Decoder',
        description: 'Decode JWT header and payload locally',
        route: '/jwt-decoder',
      },
    ],
  },
  {
    id: 'dashboards',
    title: 'Dashboards & Services',
    items: [
      {
        kind: 'external',
        title: 'Gold Price Tracker',
        description: 'Opens the external gold dashboard in a new tab.',
        href: 'https://gold.nub.io.vn/',
      },
      {
        kind: 'external',
        title: 'n8n Dashboard',
        description: 'Opens the external n8n dashboard in a new tab.',
        href: 'https://n8n.nub.io.vn/',
      },
    ],
  },
] as const

export default function HomePage() {
  return (
    <div className="mx-auto max-w-content px-[var(--ds-spacing-md)] py-[var(--ds-spacing-xxl)] sm:px-[var(--ds-spacing-xl)] sm:py-[var(--ds-spacing-section)]">
      <header className="mb-[var(--ds-spacing-xxl)] max-w-3xl">
        <h1 className="mt-2 font-display text-display-md font-semibold tracking-tight text-ink sm:text-display-lg">
          NUB Portal
        </h1>
        <p className="mt-[var(--ds-spacing-md)] text-body-lg text-ink-muted">
          Fast, keyboard-friendly utilities for JSON, YAML, encoding, diffs, and codegen. Everything
          runs locally in your tab.
        </p>
      </header>

      <div className="flex flex-col gap-[var(--ds-spacing-xxl)]">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-[var(--ds-spacing-md)] px-0 font-display text-eyebrow font-medium text-ink-tertiary">
              {section.title}
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
                        <h3 className="font-display text-card-title font-medium text-ink">{tool.title}</h3>
                        <p className="mt-[var(--ds-spacing-sm)] text-body-sm leading-relaxed text-ink-muted">
                          {tool.description}
                        </p>
                        <p className="mt-[var(--ds-spacing-lg)] inline-flex items-center gap-2 text-button font-medium text-primary">
                          Open in new tab
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
                          {tool.title}
                        </h3>
                        <p className="mt-[var(--ds-spacing-sm)] text-body-sm leading-relaxed text-ink-muted">
                          {tool.description}
                        </p>
                        <p className="mt-[var(--ds-spacing-lg)] text-button font-medium text-primary">
                          Open tool →
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
