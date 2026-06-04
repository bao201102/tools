import { marked } from 'marked'
import { useCallback, useState, useMemo, useEffect, useRef } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import hljs from 'highlight.js/lib/core'
import csharp from 'highlight.js/lib/languages/csharp'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'

// Register only the most common/needed languages
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)

const DEFAULT_SAMPLE = `# Markdown Preview Premium Showcase

Welcome to the NUB Portal **Markdown Preview** tool! This is a complete testing document covering formatting, diagrams, code syntaxes, and components.

---

## 💻 Code Blocks & Syntax Highlighting

### TypeScript (with long lines to test horizontal scrolling & sticky line numbers)
\`\`\`typescript
import { useState, useEffect } from 'react';

export const useUserStatus = (userId: string): { status: string; lastSeen: Date | null } => {
  const [data, setData] = useState<{ status: string; lastSeen: Date | null }>({ status: 'offline', lastSeen: null });

  useEffect(() => {
    // A very long line of code to verify that horizontal scroll is active and the line numbers on the left stay sticky
    const socket = new WebSocket(\`wss://api.example.com/v1/users/\${userId}/status-stream?token=abc123xyz456&client=web&version=3.5.2&mode=realtime\`);
    
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setData({ status: payload.status, lastSeen: payload.lastSeen ? new Date(payload.lastSeen) : null });
    };

    return () => socket.close();
  }, [userId]);

  return data;
};
\`\`\`

### Python (Algorithm test)
\`\`\`python
# QuickSort algorithm demonstration
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3,6,8,10,1,2,1]))
# Output: [1, 1, 2, 3, 6, 8, 10]
\`\`\`

### SQL (Structured query)
\`\`\`sql
SELECT 
  u.id AS user_id, 
  u.username, 
  o.order_number, 
  SUM(oi.price * oi.quantity) AS total_amount,
  CASE WHEN SUM(oi.price * oi.quantity) > 1000 THEN 'VIP' ELSE 'Regular' END AS customer_tier
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed' AND o.created_at >= '2026-01-01'
GROUP BY u.id, u.username, o.order_number
ORDER BY total_amount DESC
LIMIT 10;
\`\`\`

### CSS (Theme declarations)
\`\`\`css
@media (prefers-color-scheme: dark) {
  .md-code-block {
    background-color: var(--ds-color-surface-2);
    border-color: var(--ds-color-hairline);
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
}
\`\`\`

---

## 📊 Mermaid Diagrams

### Flowchart (Process Loop)
\`\`\`mermaid
flowchart TD
    Start([Initialize App]) --> LoadConfig[Load Config]
    LoadConfig --> VerifyToken{Token Valid?}
    VerifyToken -- Yes --> ShowDashboard[Load Dashboard]
    VerifyToken -- No --> RedirectLogin[Redirect to Login]
    RedirectLogin --> InputCredentials[User Inputs Credentials]
    InputCredentials --> Authenticate{Authenticate}
    Authenticate -- Success --> SaveToken[Save Token]
    SaveToken --> ShowDashboard
    Authenticate -- Fail --> ShowError[Show Invalid credentials]
    ShowError --> InputCredentials
    ShowDashboard --> End([Exit Application])
\`\`\`

### Sequence Diagram (API Request Lifecycle)
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as Web Client
    participant Proxy as API Gateway
    participant Auth as Auth Service
    participant DB as User Database

    User->>Proxy: GET /api/v1/profile
    activate Proxy
    Proxy->>Auth: Validate JWT Token
    activate Auth
    Auth->>Auth: Verify signature
    Auth-->>Proxy: Token is Valid (userId: 42)
    deactivate Auth
    Proxy->>DB: Fetch user profile (id: 42)
    activate DB
    DB-->>Proxy: Return profile data
    deactivate DB
    Proxy-->>User: HTTP 200 OK (Profile Payload)
    deactivate Proxy
\`\`\`

### Gantt Chart (Release Plan)
\`\`\`mermaid
gantt
    title Release 4.0 Planning
    dateFormat  YYYY-MM-DD
    section Requirement Analysis
    User Stories           :a1, 2026-05-01, 5d
    Design Specifications  :after a1, 3d
    section Coding Phase
    Core API Services      :2026-05-09, 10d
    UI Web Component       :2026-05-12, 10d
    section Quality Testing
    Integration Testing    :2026-05-22, 5d
    User Acceptance Test   :2026-05-26, 4d
\`\`\`

---

## 🖼️ Media Viewer

![NUB Portal Logo](https://nub.io.vn/favicon.png)
*(Click on the image above to view it in the full-screen lightbox)*

---

## 📝 Advanced Text Formatting

### Typography hierarchy
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Inline styles
This sentence shows **bold text**, *italicized text*, ~~strikethrough text~~, \`inline code elements\`. You can also combine them: ***bold and italic text***.

### Blockquotes & Callouts
> "The best way to predict the future is to invent it."
> — Alan Kay
> 
> > Blockquotes can also be nested. This is a secondary nested blockquote level.

### Lists (Ordered, Unordered, Nesting)
1. First major point
   - Sub-point A
   - Sub-point B
     1. Nested ordered item 1
     2. Nested ordered item 2
2. Second major point
   - [x] Finished item
   - [ ] Unfinished item

---

## 📅 Data Tables

| ID | Name | Role | Location | Experience | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| #101 | Alice Johnson | Lead Architect | San Francisco, CA | 8 years | 🟢 Active |
| #102 | Bob Miller | Senior Frontend Dev | Austin, TX | 6 years | 🟢 Active |
| #103 | Charlie Smith | DevOps Engineer | Remote | 4 years | 🟡 Busy |
| #104 | Diana Prince | QA Tester | London, UK | 2 years | 🔴 Away |
`

// ─── Mermaid dynamic CDN loader ──────────────────────────────────────────────
let mermaidPromise: Promise<any> | null = null

function getMermaid(): Promise<any> {
  if (mermaidPromise) return mermaidPromise

  mermaidPromise = new Promise((resolve, reject) => {
    if ((window as any).mermaid) {
      resolve((window as any).mermaid)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.min.js'
    script.async = true
    script.onload = () => {
      const m = (window as any).mermaid
      if (m) {
        resolve(m)
      } else {
        reject(new Error('Mermaid global not found after script load'))
      }
    }
    script.onerror = () => {
      reject(new Error('Failed to load Mermaid from CDN'))
    }
    document.body.appendChild(script)
  })

  return mermaidPromise
}

async function ensureMermaid(dark: boolean) {
  const m = await getMermaid()
  m.initialize({
    startOnLoad: false,
    theme: dark ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif',
  })
}

// ─── marked config ───────────────────────────────────────────────────────────
const renderer = new marked.Renderer()

// Custom code renderer: syntax highlighting + line numbers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(renderer as any).code = function (code: string, infostring: string | undefined): string {
  const text = code || ''
  const rawLang = (infostring ?? '').trim()

  let highlighted: string
  if (rawLang && hljs.getLanguage(rawLang)) {
    highlighted = hljs.highlight(text, { language: rawLang }).value
  } else {
    highlighted = hljs.highlightAuto(text).value
  }

  // Split into lines and wrap each one (enables line numbers via CSS)
  const lines = highlighted.split('\n')
  if (lines[lines.length - 1] === '') lines.pop() // trim trailing newline
  const numberedLines = lines
    .map(
      (line, i) =>
        `<span class="md-code-line"><span class="md-line-num">${i + 1}</span><span class="md-line-content">${line || '\u00a0'}</span></span>`
    )
    .join('')

  const langLabel = rawLang || 'text'
  return (
    `<div class="md-code-block" data-code="${encodeURIComponent(text)}">` +
    `<div class="md-code-header">` +
    `<span class="md-code-lang">${langLabel}</span>` +
    `<button class="md-copy-btn" type="button" aria-label="Copy code">` +
    `<span class="md-copy-btn-content">` +
    `<svg class="md-copy-icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>` +
    `<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>` +
    `</svg>` +
    `<span class="md-copy-text">Copy</span>` +
    `</span>` +
    `<span class="md-copied-btn-content">` +
    `<svg class="md-check-icon" viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<polyline points="20 6 9 17 4 12"></polyline>` +
    `</svg>` +
    `<span class="md-copy-text">Copied!</span>` +
    `</span>` +
    `</button>` +
    `</div>` +
    `<pre class="md-code-pre hljs"><code class="language-${langLabel}">${numberedLines}</code></pre>` +
    `</div>`
  )
}

marked.use({ renderer, gfm: true, breaks: true })

// Replace ```mermaid blocks with a placeholder <div> before marked parses.
// This keeps the raw mermaid source safe from HTML-escaping.
function extractMermaid(md: string): { processed: string; graphs: Map<string, string> } {
  const graphs = new Map<string, string>()
  let idx = 0
  const processed = md.replace(/```mermaid\n([\s\S]*?)```/g, (_match, code: string) => {
    const id = `mermaid-${idx++}`
    graphs.set(id, code.trim())
    return `<div class="mermaid-placeholder" data-id="${id}"></div>`
  })
  return { processed, graphs }
}

export function useMarkdownPreview() {
  const [input, setInput] = useLocalStorageState('markdown-preview:input', '')
  const [output, setOutput] = useState('')
  const darkRef = useRef(document.documentElement.classList.contains('dark'))

  // Track theme changes
  useEffect(() => {
    const obs = new MutationObserver(() => {
      darkRef.current = document.documentElement.classList.contains('dark')
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!input) { setOutput(''); return }

    const run = async () => {
      try {
        const { processed, graphs } = extractMermaid(input)
        const html = marked.parse(processed) as string

        if (graphs.size === 0) {
          setOutput(html)
          return
        }

        await ensureMermaid(darkRef.current)

        // Render each mermaid graph to SVG
        const svgMap = new Map<string, string>()
        const m = await getMermaid()
        await Promise.all(
          Array.from(graphs.entries()).map(async ([id, code]) => {
            try {
              const { svg } = await m.render(id, code)
              svgMap.set(id, svg)
            } catch (e) {
              svgMap.set(
                id,
                `<div class="mermaid-error">⚠ Mermaid error: ${e instanceof Error ? e.message : String(e)}</div>`
              )
            }
          })
        )

        // Replace placeholders with rendered SVGs
        const finalHtml = html.replace(
          /<div class="mermaid-placeholder" data-id="([^"]+)"><\/div>/g,
          (_m, id) => {
            const svg = svgMap.get(id) ?? ''
            return `<div class="mermaid-diagram">${svg}</div>`
          }
        )

        setOutput(finalHtml)
      } catch (err) {
        setOutput(
          `<div class="mermaid-error">Error parsing markdown: ${err instanceof Error ? err.message : String(err)}</div>`
        )
      }
    }

    run()
  }, [input])

  const onInputChange = useCallback((value: string) => { setInput(value) }, [])
  const clear = useCallback(() => { setInput('') }, [])
  const loadSample = useCallback(() => { setInput(DEFAULT_SAMPLE) }, [])

  const stats = useMemo(() => {
    const trimmed = input.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = input.length
    const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200))
    return { words, chars, readingTime }
  }, [input])

  return { input, output, stats, onInputChange, clear, loadSample }
}
