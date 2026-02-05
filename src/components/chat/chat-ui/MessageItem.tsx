import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources'
import { DocumentTool } from '@/components/chat/tools/doc/DocumentTool'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import { RiCheckLine, RiFileCopyLine, RiRefreshLine } from '@remixicon/react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface MessageItemProps {
  message: UIMessage
  regenerate: UseChatHelpers<UIMessage>['regenerate']
  status: UseChatHelpers<UIMessage>['status']
}

export const MessageItem = ({
  message,
  regenerate,
  status,
}: MessageItemProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (m: string) => {
    await navigator.clipboard.writeText(m)
    toast.success('Copied to Clipboard')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { role, id } = message

  // Find the text content for copying
  const textContent =
    message.parts.find((part) => part.type === 'text')?.text || ''

  return (
    <div key={message.id}>
      {message.parts.map((m, index) => {
        return (
          <Message from={message.role} key={`${message.id}-${m.type}-${index}`}>
            <MessageContent
              className={cn(role === 'assistant' ? 'w-full' : 'w-fit')}
            >
              {(() => {
                if (m.type === 'text') {
                  return <MessageResponse>{m.text}</MessageResponse>
                }

                if (m.type === 'reasoning') {
                  return (
                    <Reasoning key={`${message.id}-${m.type}-${index}`}>
                      <ReasoningTrigger />
                      <ReasoningContent>{m.text}</ReasoningContent>
                    </Reasoning>
                  )
                }

                if (m.type === 'source-url') {
                  return (
                    <Sources key={`${message.id}-${m.type}-${index}`}>
                      <SourcesTrigger count={m.sourceId?.length || 0} />
                      <SourcesContent>
                        <Source
                          href={m.url}
                          key={m.sourceId}
                          title={m.title || 'Source'}
                        />
                      </SourcesContent>
                    </Sources>
                  )
                }

                if (m.type === 'tool-createDocument') {
                  const { state, type, input, output, errorText } = m
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

                if (m.type === 'tool-editDocument') {
                  const { state, type, input, output, errorText } = m
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

                return null
              })()}
            </MessageContent>
          </Message>
        )
      })}

      {/* Action buttons outside the map - render once per message */}
      <div
        id={id}
        className={cn(
          'my-2 flex gap-1',
          role === 'user' ? 'ml-auto justify-end' : '',
        )}
      >
        {textContent && status === 'ready' && (
          <>
            <Button
              size="icon-sm"
              variant="ghost"
              className="bg-muted/50"
              onClick={() => handleCopy(textContent)}
            >
              {copied ? <RiCheckLine /> : <RiFileCopyLine />}
            </Button>
            {role === 'assistant' && (
              <Button
                size="icon-sm"
                variant="ghost"
                className="bg-muted/50"
                onClick={() => regenerate()}
              >
                <RiRefreshLine />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

