import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

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
    <div className="p-4 sm:p-8 lg:p-10">
      <header className="mb-6 sm:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Developer Tools
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Pick a tool to get started.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
        {tools.map((tool) => (
          <li key={tool.route}>
            <Link
              to={tool.route}
              className="block rounded-xl outline-none ring-violet-500/50 transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Card className="h-full">
                <h2 className="text-lg font-semibold text-slate-100">
                  {tool.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {tool.description}
                </p>
                <p className="mt-4 text-sm font-medium text-violet-400">
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
