import { useJsonUnescape } from '../hooks/useJsonUnescape'
import { JsonStringToolEditor } from './JsonStringToolEditor'

export function JsonUnescapeEditor() {
  const { input, output, setInput, clear } = useJsonUnescape()

  return (
    <JsonStringToolEditor
      descKey="tool.jsonUnescape.desc"
      inputLabelKey="tool.jsonUnescape.input"
      outputLabelKey="tool.jsonUnescape.output"
      copyOutputKey="tool.jsonUnescape.copyOutput"
      outputPlaceholderKey="tool.jsonUnescape.outputPlaceholder"
      input={input}
      output={output}
      onInputChange={setInput}
      onClear={clear}
      inputLanguage="plaintext"
      outputLanguage="json"
    />
  )
}
