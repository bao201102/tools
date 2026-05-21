import { marked } from 'marked'
import { useCallback, useState, useMemo, useEffect } from 'react'

const DEFAULT_SAMPLE = `# Markdown Preview Sample

Welcome to the NUB Portal **Markdown Preview** tool! This utility compiles Markdown text into HTML in real-time.

## Features

1. **GFM (GitHub Flavored Markdown)**: Supports checklists, tables, code formatting, autolinks, and strikethroughs.
2. **Keyboard-Friendly**: Seamless text editing with Monaco Editor.
3. **Word Stats**: Real-time word count, character count, and estimated reading time.
4. **Light & Dark Mode**: The preview styles adjust to your theme.

### Text Formatting

You can write text in *italics*, **bold**, or ~~strikethrough~~. You can also write inline \`code\` or block code:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}!\`;
};
\`\`\`

### Lists & Checklists

- [x] Create a stunning markdown editor
- [x] Integrate GFM styling
- [ ] Add PDF export feature

### Tables

| Name | Role | Location |
| :--- | :--- | :--- |
| Alice | Tech Lead | New York |
| Bob | Frontend Developer | Hanoi |

### Blockquote

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

For more information, see [Markdown Guide](https://www.markdownguide.org).
`

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
})

export function useMarkdownPreview() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  useEffect(() => {
    if (!input) {
      setOutput('')
      return
    }
    try {
      const parsed = marked.parse(input)
      setOutput(typeof parsed === 'string' ? parsed : '')
    } catch (err) {
      setOutput(`<div class="text-red-500">Error parsing markdown: ${err instanceof Error ? err.message : String(err)}</div>`)
    }
  }, [input])

  const onInputChange = useCallback((value: string) => {
    setInput(value)
  }, [])

  const clear = useCallback(() => {
    setInput('')
  }, [])

  const loadSample = useCallback(() => {
    setInput(DEFAULT_SAMPLE)
  }, [])

  const stats = useMemo(() => {
    const trimmed = input.trim()
    const words = trimmed ? trimmed.split(/\s+/).length : 0
    const chars = input.length
    const readingTime = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200))
    return { words, chars, readingTime }
  }, [input])

  return {
    input,
    output,
    stats,
    onInputChange,
    clear,
    loadSample,
  }
}
