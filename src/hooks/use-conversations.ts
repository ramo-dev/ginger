import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { conversations, messages } from '@/db/schema'

type Conversation = typeof conversations.$inferSelect
type Message = typeof messages.$inferSelect

// API functions
const fetchConversations = async (): Promise<Conversation[]> => {
  const response = await fetch('/api/chat/conversations')
  if (!response.ok) {
    throw new Error('Failed to fetch conversations')
  }
  return response.json()
}

const createConversation = async (title: string): Promise<Conversation> => {
  const response = await fetch('/api/chat/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error('Failed to create conversation')
  }
  return response.json()
}

const fetchConversation = async (
  id: string,
): Promise<{ conversation: Conversation; messages: Message[] }> => {
  const response = await fetch(`/api/chat/conversations/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch conversation')
  }
  return response.json()
}

const updateConversation = async ({
  id,
  title,
}: {
  id: string
  title: string
}): Promise<Conversation> => {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })
  if (!response.ok) {
    throw new Error('Failed to update conversation')
  }
  return response.json()
}

const deleteConversation = async (id: string): Promise<void> => {
  const response = await fetch(`/api/chat/conversations/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete conversation')
  }
}

const createMessage = async ({
  conversationId,
  role,
  content,
}: {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
}): Promise<Message> => {
  const response = await fetch(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, content }),
    },
  )
  if (!response.ok) {
    throw new Error('Failed to create message')
  }
  return response.json()
}

// Hooks
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => fetchConversation(id),
    enabled: !!id,
  })
}

export const useUpdateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.setQueryData(['conversation', data.id], data)
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.conversationId],
      })
    },
  })
}
