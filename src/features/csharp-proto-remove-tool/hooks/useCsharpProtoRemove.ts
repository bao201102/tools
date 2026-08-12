import { useCallback, useMemo } from 'react'
import { useLocalStorageState } from '../../../lib/useLocalStorageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'

const PROTO_MEMBER_ATTR_RE = /\[ProtoMember\s*\(\s*\d*\s*\)\s*\]\s*/g

export function processCsharpProtoRemoveSource(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(PROTO_MEMBER_ATTR_RE, ''))
    .join('\n')
}

export function useCsharpProtoRemove() {
  const [input, setInput] = useLocalStorageState('csharp-proto-remove:input', '')
  const debouncedInput = useDebouncedValue(input)

  const output = useMemo(() => processCsharpProtoRemoveSource(debouncedInput), [debouncedInput])

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
