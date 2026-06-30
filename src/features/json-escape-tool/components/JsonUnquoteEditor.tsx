import { useJsonUnquote } from '../hooks/useJsonUnquote'
import { JsonStringToolEditor } from './JsonStringToolEditor'

export function JsonUnquoteEditor() {
  const { input, output, setInput, clear } = useJsonUnquote()

  return (
    <JsonStringToolEditor
      descKey="tool.jsonUnquote.desc"
      inputLabelKey="tool.jsonUnquote.input"
      outputLabelKey="tool.jsonUnquote.output"
      copyOutputKey="tool.jsonUnquote.copyOutput"
      outputPlaceholderKey="tool.jsonUnquote.outputPlaceholder"
      input={input}
      output={output}
      onInputChange={setInput}
      onClear={clear}
      inputLanguage="plaintext"
      outputLanguage="json"
    />
  )
}
