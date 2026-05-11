import { useCallback, useState } from 'react'

const PROTO_MEMBER_ATTR_RE = /\[ProtoMember\s*\(\s*\d+\s*\)\s*\]\s*/g

export function processCsharpProtoRemoveSource(input: string): string {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(PROTO_MEMBER_ATTR_RE, ''))
    .join('\n')
}

export function useCsharpProtoRemove() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
  }, [])

  const setInputLive = useCallback((value: string) => {
    setInput(value)
    setOutput(processCsharpProtoRemoveSource(value))
  }, [])

  return {
    input,
    setInput: setInputLive,
    output,
    clear,
  }
}
