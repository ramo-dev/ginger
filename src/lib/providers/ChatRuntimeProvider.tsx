'use client'

import {
  AssistantRuntimeProvider,
  type unstable_RemoteThreadListAdapter as RemoteThreadListAdapter,
  RuntimeAdapterProvider,
  type ThreadHistoryAdapter,
  type ThreadMessage,
  useAui,
  unstable_useRemoteThreadListRuntime as useRemoteThreadListRuntime,
} from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { createAssistantStream } from 'assistant-stream'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useMCPStore } from '@/lib/store/mcp-store'
import { useModelStore } from '@/lib/store/model-store'
import { DefaultChatTransport } from 'ai'

// Type definitions for database responses
interface DBMessage {
  id: string
  role: 'user' | 'assistant'
  content: string | Array<{ type: string; text: string }>
  createdAt: string
}

interface DBConversation {
  id: string
  title: string
  archived: boolean
}

// Component that provides thread-specific history adapter
const ThreadProvider = ({ children }: { children?: ReactNode }) => {
  const aui = useAui()

  const history = useMemo<ThreadHistoryAdapter>(
    () => ({
      async load() {
        try {
          const { remoteId } = aui.threadListItem().getState()
          if (!remoteId) return { messages: [] }

          const response = await fetch(`/api/chat/conversations/${remoteId}`)
          if (!response.ok) return { messages: [] }

          const data = await response.json()
          return {
            messages: data.messages.map((m: DBMessage) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
              id: m.id,
              createdAt: new Date(m.createdAt),
            })),
          }
        } catch (error) {
          console.error('Failed to load messages:', error)
          return { messages: [] }
        }
      },

      async append(message) {
        try {
          // ✅ Always await initialization
          const threadItem = aui.threadListItem()
          const { remoteId } = await threadItem.initialize()

          await fetch(`/api/chat/conversations/${remoteId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: message.message.role,
              content: message.message.content, // ✅ FIXED: was message.message.role
              id: message.message.id,
              createdAt: message.message.createdAt || new Date().toISOString(),
            }),
          })
        } catch (error) {
          console.error('Failed to append message:', error)
        }
      },
    }),
    [aui],
  )

  const adapters = useMemo(() => ({ history }), [history])

  return (
    <RuntimeAdapterProvider adapters={adapters}>
      {children}
    </RuntimeAdapterProvider>
  )
}

// Database adapter with all required methods
const databaseAdapter: RemoteThreadListAdapter = {
  async list() {
    try {
      const response = await fetch('/api/chat/conversations')
      if (!response.ok) throw new Error('Failed to fetch conversations')

      const conversations = await response.json()
      return {
        threads: conversations.map((conv: DBConversation) => ({
          status: conv.archived ? 'archived' : 'regular',
          remoteId: conv.id,
          title: conv.title,
        })),
      }
    } catch (error) {
      console.error('Failed to list threads:', error)
      return { threads: [] }
    }
  },

  async initialize() {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      })
      if (!response.ok) throw new Error('Failed to create conversation')

      const conversation = await response.json()
      return {
        remoteId: conversation.id,
        externalId: conversation.id,
      }
    } catch (error) {
      console.error('Failed to initialize thread:', error)
      throw error // Re-throw so UI knows initialization failed
    }
  },

  async rename(remoteId: string, newTitle: string) {
    try {
      await fetch(`/api/chat/conversations/${remoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
    } catch (error) {
      console.error('Failed to rename thread:', error)
      throw error
    }
  },

  async archive(remoteId: string) {
    try {
      await fetch(`/api/chat/conversations/${remoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      })
    } catch (error) {
      console.error('Failed to archive thread:', error)
      throw error
    }
  },

  async unarchive(remoteId: string) {
    try {
      await fetch(`/api/chat/conversations/${remoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      })
    } catch (error) {
      console.error('Failed to unarchive thread:', error)
      throw error
    }
  },

  async delete(remoteId: string) {
    try {
      await fetch(`/api/chat/conversations/${remoteId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Failed to delete thread:', error)
      throw error
    }
  },

  async generateTitle(
    remoteId: string,
    unstable_messages: readonly ThreadMessage[],
  ) {
    try {
      const firstUserMessage = unstable_messages.find((m) => m.role === 'user')
      // Extract text from content parts
      let title = 'New Conversation'
      if (firstUserMessage?.content) {
        const textParts = firstUserMessage.content
          .filter((c) => c.type === 'text')
          .map((c) => ('text' in c ? c.text : ''))
          .join('\n')
        title = textParts.slice(0, 50) || 'New Conversation'
      }

      await fetch(`/api/chat/conversations/${remoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      return createAssistantStream((controller) => {
        controller.appendText(title)
        controller.close()
      })
    } catch (error) {
      console.error('Failed to generate title:', error)
      return createAssistantStream((controller) => {
        controller.appendText('New Conversation')
        controller.close()
      })
    }
  },

  async fetch(remoteId: string) {
    try {
      const response = await fetch(`/api/chat/conversations/${remoteId}`)
      if (!response.ok) throw new Error('Failed to fetch thread')

      const conversation = await response.json()
      return {
        status: conversation.archived ? 'archived' : 'regular',
        remoteId: conversation.id,
        title: conversation.title,
      }
    } catch (error) {
      console.error('Failed to fetch thread:', error)
      throw error
    }
  },
}

export function ChatRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  // ✅ Subscribe to store state at component level
  const selectedModelId = useModelStore((state) => state.selectedModelId)
  const selectedProvider = useModelStore((state) => state.selectedProvider)
  const ollamaBaseUrl = useModelStore((state) => state.ollamaBaseUrl)
  const enabledMCPs = useMCPStore((state) => state.enabledMCPs)

  // ✅ Create chat runtime at component level with useMemo
  const chatRuntime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({
        model: selectedModelId,
        provider: selectedProvider,
        ollamaUrl: ollamaBaseUrl,
        enabledMCPs: enabledMCPs,
      }),
    }),
  })

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () => chatRuntime,
    adapter: {
      ...databaseAdapter,
      unstable_Provider: ThreadProvider,
    },
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
