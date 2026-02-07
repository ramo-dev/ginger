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
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import {
  RiCheckLine,
  RiFileCopyLine,
  RiRefreshLine,
  RiPencilLine,
  RiCloseLine,
} from '@remixicon/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ChatInput } from './ChatInput'
import { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { useModelStore } from '@/lib/store/model-store'
import ChatTools from './ChatTools'

interface MessageItemProps {
  message: UIMessage
  regenerate: UseChatHelpers<UIMessage>['regenerate']
  status: UseChatHelpers<UIMessage>['status']
  sendMessage: UseChatHelpers<UIMessage>['sendMessage']
  setMessages: UseChatHelpers<UIMessage>['setMessages']
  messages: UseChatHelpers<UIMessage>['messages']
  stop: UseChatHelpers<UIMessage>['stop']
  resume: UseChatHelpers<UIMessage>['resumeStream']
}

export const MessageItem = ({
  message,
  regenerate,
  status,
  sendMessage,
  setMessages,
  messages,
  stop,
  resume,
}: MessageItemProps) => {
  const [copied, setCopied] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')

  const { selectedModelId, setSelectedModel, getAllModels } = useModelStore()

  const handleCopy = async (m: string) => {
    await navigator.clipboard.writeText(m)
    toast.success('Copied to Clipboard')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    setEditText(textContent)
    setEditMode(true)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setEditText('')
  }

  const models = getAllModels()

  const handleSubmitEdit = (editedMessage: PromptInputMessage) => {
    stop()
    const model = models.find((m) => m.id === selectedModelId)

    console.log('SELECTED_MODEL', model)

    if (model) {
      setSelectedModel(selectedModelId, model.provider)
    }

    // Find the index of the current message
    const messageIndex = messages.findIndex((m) => m.id === message.id)

    if (messageIndex === -1) return

    // Remove this message and all messages after it
    // This will remove the old user message and the assistant's response
    const newMessages = messages.slice(0, messageIndex)

    setMessages(newMessages)

    // Send the edited message - this will add it as a new message
    sendMessage(editedMessage)

    setEditMode(false)
    setEditText('')
  }

  const { role, id } = message

  // Find the text content for copying
  const textContent =
    message.parts.find((part) => part.type === 'text')?.text || ''

  return (
    <div key={`message-${id}-${+1}`}>
      {!editMode ? (
        message.parts.map((m, index) => {
          return (
            <Message
              from={message.role}
              key={`${message.id}-${m.type}-${index}`}
            >
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

                  ;<ChatTools part={m} />
                  return null
                })()}
              </MessageContent>
            </Message>
          )
        })
      ) : (
        <div className="w-full">
          <ChatInput
            stop={stop}
            resume={resume}
            text={editText}
            setText={setEditText}
            status={'ready'}
            onSubmit={handleSubmitEdit}
          />
        </div>
      )}

      {/* Action buttons outside the map - render once per message */}

      <div
        id={id}
        className={cn(
          'my-2 flex gap-1',
          role === 'user' ? 'ml-auto justify-end' : '',
        )}
      >
        {role === 'user' && (
          <Button
            size="icon-sm"
            variant="ghost"
            className="bg-muted/50"
            onClick={editMode ? handleCancelEdit : handleEdit}
          >
            {editMode ? <RiCloseLine /> : <RiPencilLine />}
          </Button>
        )}

        {textContent && !editMode && (
          <>
            <Button
              size="icon-sm"
              variant="ghost"
              className={cn(
                role === 'assistant' && status !== 'ready' ? 'hidden' : '',
                'bg-muted/50',
              )}
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

