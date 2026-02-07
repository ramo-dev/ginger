'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { MessageList } from '@/components/chat/chat-ui/MessageList'
import { ChatInput } from '@/components/chat/chat-ui/ChatInput'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai'
import { useMCPStore } from '@/lib/store/mcp-store'
import { useModelStore } from '@/lib/store/model-store'
import ChatSuggestions from '../chat-ui/ChatSuggestions'

const ChatLayout = () => {
  const [text, setText] = useState<string>('')
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false)
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false)
  const { enabledMCPs } = useMCPStore()
  const { selectedModelId, selectedProvider, ollamaBaseUrl, reasoning } =
    useModelStore()

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          enabledMCPs,
          model: selectedModelId,
          provider: selectedProvider,
          ollamaUrl: ollamaBaseUrl,
          reasoning: reasoning,
        },
      }),
    [selectedModelId, selectedProvider, ollamaBaseUrl, reasoning, enabledMCPs],
  )

  const {
    messages,
    sendMessage,
    status,
    regenerate,
    setMessages,
    stop,
    resumeStream: resume,
  } = useChat({
    transport: chatTransport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  })

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text)
    const hasAttachments = Boolean(message.files?.length)

    if (!(hasText || hasAttachments)) {
      return
    }

    if (message.files?.length) {
      toast.success('Files attached', {
        description: `${message.files.length} file(s) attached to message`,
      })
    }

    sendMessage(message)

    setText('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({
      text: suggestion,
    })
  }

  return (
    <div className="relative max-h-screen h-full justify-between flex size-full flex-col overflow-hidden">
      <MessageList
        stop={stop}
        resume={resume}
        setMessages={setMessages}
        sendMessage={sendMessage}
        regenerate={regenerate}
        messages={messages}
        status={status}
      />
      {!messages.length && (
        <div className="mt-auto max-w-3xl w-full mx-auto">
          <ChatSuggestions onSuggestionClick={handleSuggestionClick} />
        </div>
      )}
      <div className="grid shrink-0 gap-4 max-w-3xl w-full mx-auto pt-4">
        <ChatInput
          stop={stop}
          resume={resume}
          text={text}
          setText={setText}
          useWebSearch={useWebSearch}
          setUseWebSearch={setUseWebSearch}
          useMicrophone={useMicrophone}
          setUseMicrophone={setUseMicrophone}
          status={status}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default ChatLayout
