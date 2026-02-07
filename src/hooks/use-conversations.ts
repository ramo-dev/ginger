import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { conversations, messages } from '@/db/schema'
import {
  getConversations as getConversationsServerFn,
  getConversation as getConversationServerFn,
  createConversation as createConversationServerFn,
  updateConversation as updateConversationServerFn,
  deleteConversation as deleteConversationServerFn,
  createMessage as createMessageServerFn,
} from '@/lib/api/conversations'

type Conversation = typeof conversations.$inferSelect
type Message = typeof messages.$inferSelect

// Hooks
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversationsServerFn(),
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title: string) => createConversationServerFn({ data: { title } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useConversation = (id: string) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversationServerFn({ data: id }),
    enabled: !!id,
  })
}

export const useUpdateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateConversationServerFn({ data: { id, title } }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.setQueryData(['conversation', data.id], data)
    },
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteConversationServerFn({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      role,
      content,
    }: {
      conversationId: string
      role: 'user' | 'assistant'
      content: string
    }) => createMessageServerFn({ data: { conversationId, role, content } }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.conversationId],
      })
    },
  })
}
