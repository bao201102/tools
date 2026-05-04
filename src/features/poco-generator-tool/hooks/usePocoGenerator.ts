import { useCallback, useState } from 'react'
import { generatePocoCode, type AttributeStyle } from '../utils/pocoGenerator'

export function usePocoGenerator() {
  const [input, setInputState] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rootClassName, setRootClassName] = useState('Root')
  const [attributeStyle, setAttributeStyle] = useState<AttributeStyle>('newtonsoft')

  const applyGenerate = useCallback((nextInput: string, nextRootClassName: string, nextStyle: AttributeStyle) => {
    if (nextInput.trim() === '') {
      setOutput('')
      setError(null)
      return
    }

    try {
      const result = generatePocoCode(nextInput, nextRootClassName.trim() || 'Root', nextStyle)
      setOutput(result)
      setError(null)
    } catch (err) {
      setOutput('')
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }, [])

  const setInput = useCallback(
    (value: string) => {
      setInputState(value)
      applyGenerate(value, rootClassName, attributeStyle)
    },
    [applyGenerate, attributeStyle, rootClassName],
  )

  const setRootClassNameLive = useCallback(
    (value: string) => {
      setRootClassName(value)
      applyGenerate(input, value, attributeStyle)
    },
    [applyGenerate, attributeStyle, input],
  )

  const setAttributeStyleLive = useCallback(
    (value: AttributeStyle) => {
      setAttributeStyle(value)
      applyGenerate(input, rootClassName, value)
    },
    [applyGenerate, input, rootClassName],
  )

  const generate = useCallback(() => {
    applyGenerate(input, rootClassName, attributeStyle)
  }, [applyGenerate, attributeStyle, input, rootClassName])

  const clear = useCallback(() => {
    setInput('')
    setOutput('')
    setError(null)
    setRootClassName('Root')
  }, [])

  return {
    input,
    setInput,
    output,
    error,
    rootClassName,
    setRootClassName: setRootClassNameLive,
    attributeStyle,
    setAttributeStyle: setAttributeStyleLive,
    generate,
    clear,
  }
}
