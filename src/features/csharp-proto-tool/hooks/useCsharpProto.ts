import { useCallback, useState } from 'react'

const PROTO_MEMBER_ATTR_RE = /\[ProtoMember\s*\(\s*\d+\s*\)\s*\]\s*/g

function isCommentLine(line: string): boolean {
  return /^\s*\/\//.test(line)
}

function isBlankLine(line: string): boolean {
  return line.trim() === ''
}

function stripProtoMemberAttributes(line: string): string {
  return line.replace(PROTO_MEMBER_ATTR_RE, '')
}

/**
 * Detects typical C# auto-properties (including virtual/static and private/protected set/init).
 */
function isPropertyLine(line: string): boolean {
  const t = line.trim()
  if (!t || t.startsWith('//')) return false
  if (!/^(public|private|protected|internal)\b/.test(t)) return false
  return /\{\s*get\s*;\s*(?:(?:private|protected|internal|public)\s+)?(?:set|init)\s*;\s*\}/.test(t)
}

export function processCsharpProtoSource(input: string, startNumber: number): string {
  const lines = input.split(/\r?\n/)
  let current = startNumber
  const out: string[] = []

  for (const line of lines) {
    if (isBlankLine(line) || isCommentLine(line)) {
      out.push(line)
      continue
    }

    const cleaned = stripProtoMemberAttributes(line)

    if (isPropertyLine(cleaned)) {
      const indentMatch = cleaned.match(/^(\s*)/)
      const indent = indentMatch?.[1] ?? ''
      const cleanedProperty = cleaned.slice(indent.length).replace(/\r?\n+$/, '')
      out.push(`${indent}[ProtoMember(${current})] ${cleanedProperty}`)
      current += 1
    } else {
      out.push(cleaned)
    }
  }

  return out.join('\n')
}

export function useCsharpProto() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [startNumber, setStartNumber] = useState(1)

  const process = useCallback(() => {
    const start = Number.isFinite(startNumber) && startNumber >= 1 ? Math.floor(startNumber) : 1
    setOutput(processCsharpProtoSource(input, start))
  }, [input, startNumber])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  const setStartNumberSafe = useCallback((value: number) => {
    setStartNumber(Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1)
  }, [])

  return {
    input,
    setInput,
    output,
    startNumber,
    setStartNumber: setStartNumberSafe,
    process,
    clear,
  }
}
