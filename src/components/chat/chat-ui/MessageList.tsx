import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { MessageItem } from './MessageItem'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import ModelStreamingLoader from './ModelStreaming'
import { MessageError } from './MessageError'

interface MessageListProps {
  messages: UIMessage[]
  regenerate: UseChatHelpers<UIMessage>['regenerate']
  status: UseChatHelpers<UIMessage>['status']
  sendMessage: UseChatHelpers<UIMessage>['sendMessage']
  setMessages: UseChatHelpers<UIMessage>['setMessages']
  stop: UseChatHelpers<UIMessage>['stop']
  resume: UseChatHelpers<UIMessage>['resumeStream']
}

export const MessageList = ({
  messages,
  regenerate,
  status,
  sendMessage,
  setMessages,
  stop,
  resume,
}: MessageListProps) => {
  return (
    <Conversation>
      <ConversationContent className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <div className="gap-2 flex flex-col">
            {message.role === 'assistant' &&
              (status === 'submitted' || status === 'streaming') && (
                <ModelStreamingLoader />
              )}
            <MessageItem
              stop={stop}
              resume={resume}
              setMessages={setMessages}
              messages={messages}
              sendMessage={sendMessage}
              status={status}
              regenerate={regenerate}
              key={message.id}
              message={message}
            />

            {status === 'error' && (
              <MessageError
                regenerate={regenerate}
                error="Failed to get Ai Response"
              />
            )}
          </div>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
