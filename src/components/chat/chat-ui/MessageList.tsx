import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { MessageItem } from './MessageItem'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'

interface MessageListProps {
  messages: UIMessage[]
  regenerate: UseChatHelpers<UIMessage>['regenerate']
  status: UseChatHelpers<UIMessage>['status']
}

export const MessageList = ({
  messages,
  regenerate,
  status,
}: MessageListProps) => {
  return (
    <Conversation>
      <ConversationContent className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <MessageItem
            status={status}
            regenerate={regenerate}
            key={message.id}
            message={message}
          />
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
