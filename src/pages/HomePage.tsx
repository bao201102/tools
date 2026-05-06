import { Link } from 'react-router-dom'
import { Card } from '../components/ui'

const tools = [
  {
    title: 'JSON Formatter',
    description: 'Pretty-print as you type; minify to one line on demand',
    route: '/json',
  },
  {
    title: 'JSON Escaper & Unescaper',
    description:
      'Convert escaped string payloads ↔ pretty JSON — bidirectional realtime with smart unwrap.',
    route: '/json-escape',
  },
  {
    title: 'YAML Formatter',
    description: 'Normalize and validate YAML as you type',
    route: '/yaml',
  },
  {
    title: 'C# ProtoMember Reindex',
    description: 'Re-sequence [ProtoMember] attributes on C# properties',
    route: '/csharp-proto',
  },
  {
    title: 'Base64 / URL Encoder & Decoder',
    description: 'Encode and decode Base64 or URL-encoded text',
    route: '/encoder',
  },
  {
    title: 'Text & Code Diff Checker',
    description: 'Compare Original vs Modified with side-by-side or inline Monaco diff',
    route: '/diff-checker',
  },
  {
    title: 'JSON to C# POCO Generator',
    description: 'Generate C# class definitions from JSON input',
    route: '/json-to-csharp',
  },
  {
    title: 'JWT Decoder',
    description: 'Decode JWT header and payload locally',
    route: '/jwt-decoder',
  },
] as const

export default function HomePage() {
  return (
    <div className="mx-auto max-w-content px-[var(--ds-spacing-md)] py-[var(--ds-spacing-xxl)] sm:px-[var(--ds-spacing-xl)] sm:py-[var(--ds-spacing-section)]">
      <header className="mb-[var(--ds-spacing-xxl)] max-w-3xl">
        <h1 className="mt-2 font-display text-display-md font-semibold tracking-tight text-ink sm:text-display-lg">
          Developer tools
        </h1>
        <p className="mt-[var(--ds-spacing-md)] text-body-lg text-ink-muted">
          Fast, keyboard-friendly utilities for JSON, YAML, encoding, diffs, and codegen. Everything
          runs locally in your tab.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-[var(--ds-spacing-lg)] sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.route}>
            <Link
              to={tool.route}
              className="group block rounded-lg outline-none focus-visible:ds-focus-ring"
            >
              <Card interactive className="relative h-full">
                <h2 className="font-display text-card-title font-medium text-ink">{tool.title}</h2>
                <p className="mt-[var(--ds-spacing-sm)] text-body-sm leading-relaxed text-ink-muted">
                  {tool.description}
                </p>
                <p className="mt-[var(--ds-spacing-lg)] text-button font-medium text-primary">
                  Open tool →
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
