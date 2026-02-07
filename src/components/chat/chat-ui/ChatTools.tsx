import { UIMessage } from '@ai-sdk/react'
import { DocumentTool } from '../tools/doc/DocumentTool'
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool'

type MessagePart = UIMessage['parts'][number]

function isToolPart(
  part: MessagePart,
): part is Extract<MessagePart, { type: `tool-${string}` }> {
  return typeof part.type === 'string' && part.type.startsWith('tool-')
}

export default function ChatTools({ part }: { part: MessagePart }) {
  if (!isToolPart(part)) {
    return null
  }

  if (
    part.type === 'tool-createDocument' ||
    part.type === 'tool-editDocument'
  ) {
    return (
      <DocumentTool
        input={
          part.input as {
            title: string
            content: string
            fileType: 'html' | 'txt' | 'md' | 'docx' | 'pdf'
          }
        }
        output={
          part.output as
            | {
                id: string
                title: string
                content: string
                fileType: string
                downloadUrl?: string
                success: boolean
              }
            | undefined
        }
        errorText={part.errorText}
        state={part.state}
        type={part.type}
      />
    )
  }

  if (part.type === 'tool-editDocument') {
    const { state, type, input, output, errorText } = part
    return (
      <DocumentTool
        input={
          input as {
            title: string
            content: string
            fileType: 'html' | 'txt' | 'md' | 'docx' | 'pdf'
          }
        }
        output={
          output as
            | {
                id: string
                title: string
                content: string
                fileType: string
                downloadUrl?: string
                success: boolean
              }
            | undefined
        }
        errorText={errorText}
        state={state}
        type={type}
      />
    )
  }

  // Add more tool handlers here
  // if (part.type === 'tool-anotherTool') { ... }

  // Fallback for unknown tools
  return (
    <Tool defaultOpen={true}>
      <ToolHeader type="tool-search" title={part.title} state={part.state} />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput output={part?.output} errorText={part.errorText} />
      </ToolContent>
    </Tool>
  )
}
