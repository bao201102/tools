import { useCallback, useState } from 'react'

const PROTO_MEMBER_ATTR_RE = /\[ProtoMember\s*\(\s*\d*\s*\)\s*\]\s*/g
const PROTO_CONTRACT_ATTR_RE = /\[ProtoContract\s*(?:\([^)]*\))?\s*\]/
const CLASS_DECL_RE = /^\s*(?:public|private|protected|internal|abstract|sealed|static|partial|\s)*\bclass\b/
const NAMESPACE_DECL_RE = /^\s*(?:namespace)\b/
const PROTOBUF_USING_RE = /^\s*(?:global\s+)?using\s+ProtoBuf\s*;/

function isCommentLine(line: string): boolean {
  return /^\s*\/\//.test(line)
}

function isBlankLine(line: string): boolean {
  return line.trim() === ''
}

function stripProtoMemberAttributes(line: string): string {
  return line.replace(PROTO_MEMBER_ATTR_RE, '')
}

function isClassDeclarationLine(line: string): boolean {
  return CLASS_DECL_RE.test(line)
}

function hasNamespace(lines: string[]): boolean {
  return lines.some((line) => NAMESPACE_DECL_RE.test(line))
}

function hasProtoBufUsing(lines: string[]): boolean {
  return lines.some((line) => PROTOBUF_USING_RE.test(line))
}

function ensureProtoBufUsing(lines: string[]): string[] {
  if (!hasNamespace(lines) || hasProtoBufUsing(lines)) return lines

  const result = [...lines]
  let insertIndex = 0
  while (insertIndex < result.length && (isBlankLine(result[insertIndex]) || isCommentLine(result[insertIndex]))) {
    insertIndex += 1
  }
  while (insertIndex < result.length && /^\s*using\b/.test(result[insertIndex])) {
    insertIndex += 1
  }

  result.splice(insertIndex, 0, 'using ProtoBuf;')
  return result
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

function hasProtoContractAttribute(line: string): boolean {
  return PROTO_CONTRACT_ATTR_RE.test(line)
}

export function processCsharpProtoSource(input: string, startNumber: number): string {
  const lines = ensureProtoBufUsing(input.split(/\r?\n/))
  let current = startNumber
  const out: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (isClassDeclarationLine(line)) {
      current = startNumber

      // Check if previous non-blank/non-comment line has [ProtoContract]
      let hasContract = false
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[j]
        if (isBlankLine(prevLine) || isCommentLine(prevLine)) continue
        if (hasProtoContractAttribute(prevLine)) {
          hasContract = true
        }
        break
      }

      // If no [ProtoContract], add it before the class
      if (!hasContract) {
        const indentMatch = line.match(/^(\s*)/)
        const indent = indentMatch?.[1] ?? ''
        out.push(`${indent}[ProtoContract]`)
      }
    }

    if (isBlankLine(line) || isCommentLine(line)) {
      out.push(line)
      i++
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

    i++
  }

  return out.join('\n')
}

export function useCsharpProto() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [startNumber, setStartNumber] = useState(1)

  const getSafeStart = useCallback((value: number) => {
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1
  }, [])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  const setInputLive = useCallback(
    (value: string) => {
      setInput(value)
      const start = getSafeStart(startNumber)
      setOutput(processCsharpProtoSource(value, start))
    },
    [getSafeStart, startNumber],
  )

  const setStartNumberSafe = useCallback(
    (value: number) => {
      const safe = getSafeStart(value)
      setStartNumber(safe)
      setOutput(processCsharpProtoSource(input, safe))
    },
    [getSafeStart, input],
  )

  return {
    input,
    setInput: setInputLive,
    output,
    startNumber,
    setStartNumber: setStartNumberSafe,
    clear,
  }
}
