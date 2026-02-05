import { makeAssistantToolUI } from '@assistant-ui/react'
import {
  parseSerializableTerminal,
  Terminal,
  TerminalErrorBoundary,
} from '@/components/chat/tools/terminal/index'

function ParsedTerminal({ result }: { result: unknown }) {
  const props = parseSerializableTerminal(result)
  return <Terminal {...props} />
}

export const ShowTerminalUI = makeAssistantToolUI({
  toolName: 'showTerminal',
  render: ({ result }) => {
    // Tool outputs stream in; `result` will be `undefined` until the tool resolves.
    if (result === undefined) {
      return <Terminal id="loading" command="…" exitCode={0} isLoading />
    }
    return (
      <TerminalErrorBoundary>
        <ParsedTerminal result={result} />
      </TerminalErrorBoundary>
    )
  },
})

export const ExecuteTerminalUI = makeAssistantToolUI({
  toolName: 'executeTerminalCommand',
  render: ({ result }) => {
    // Tool outputs stream in; `result` will be `undefined` until the tool resolves.
    if (result === undefined) {
      return <Terminal id="loading" command="…" exitCode={0} isLoading />
    }
    return (
      <TerminalErrorBoundary>
        <ParsedTerminal result={result} />
      </TerminalErrorBoundary>
    )
  },
})
