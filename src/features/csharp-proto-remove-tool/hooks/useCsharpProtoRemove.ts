import { useCallback, useEffect, useState } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'

const PROTO_MEMBER_ATTR_RE = /\[ProtoMember\s*\(\s*\d*\s*\)\s*\]\s*/g

export function processCsharpProtoRemoveSource(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(PROTO_MEMBER_ATTR_RE, ''))
    .join('\n')
}

export function useCsharpProtoRemove() {
  const [input, setInput] = useLocalStorageState('csharp-proto-remove:input', '')
  const [output, setOutput] = useState('')

  useEffect(() => {
    setOutput(processCsharpProtoRemoveSource(input))
  }, [input])

  const clear = useCallback(() => {
    setInput('')
  }, [setInput])

  return {
    input,
    setInput,
    output,
    clear,
  }
}
