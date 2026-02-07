import { createServerFn } from '@tanstack/react-start'
import { db } from '@/db'
import { conversations, messages } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

/**
 * Get all conversations for the current user
 * Returns conversations ordered by most recently updated
 */
export const getConversations = createServerFn({ method: 'GET' }).handler(
    async () => {
        const data = await db
            .select()
            .from(conversations)
            .orderBy(desc(conversations.updatedAt))
            .limit(20)
        return data.map((c) => ({
            ...c,
            metadata: (c.metadata ?? {}) as any,
        }))
    },
)

/**
 * Get a single conversation with its messages
 */
export const getConversation = createServerFn({ method: 'POST' }).handler(
    async (ctx) => {
        const id = (ctx.data || '') as string

        if (!id) {
            throw new Error('Conversation ID is required')
        }

        const [conversation] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, id))
            .limit(1)

        if (!conversation) {
            throw new Error('Conversation not found')
        }

        const conversationMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, id))
            .orderBy(messages.createdAt)

        return {
            conversation: {
                ...conversation,
                metadata: (conversation.metadata ?? {}) as any,
            },
            messages: conversationMessages,
        }
    },
)

/**
 * Create a new conversation
 */
export const createConversation = createServerFn({ method: 'POST' }).handler(
    async (ctx) => {
        const title = ((ctx.data as any)?.title || 'New Chat') as string

        const [newConversation] = await db
            .insert(conversations)
            .values({
                title,
                metadata: {},
            })
            .returning()

        return {
            ...newConversation,
            metadata: (newConversation.metadata ?? {}) as any,
        }
    },
)

/**
 * Update a conversation
 */
export const updateConversation = createServerFn({ method: 'POST' }).handler(
    async (ctx) => {
        const data = ctx.data as { id: string; title: string }

        if (!data?.id || !data?.title) {
            throw new Error('Conversation ID and title are required')
        }

        const [updated] = await db
            .update(conversations)
            .set({
                title: data.title,
                updatedAt: new Date(),
            })
            .where(eq(conversations.id, data.id))
            .returning()

        if (!updated) {
            throw new Error('Conversation not found')
        }

        return {
            ...updated,
            metadata: (updated.metadata ?? {}) as any,
        }
    },
)

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = createServerFn({ method: 'POST' }).handler(
    async (ctx) => {
        const id = (ctx.data || '') as string

        if (!id) {
            throw new Error('Conversation ID is required')
        }

        // Delete all messages first
        await db.delete(messages).where(eq(messages.conversationId, id))

        // Then delete the conversation
        await db.delete(conversations).where(eq(conversations.id, id))

        return { success: true }
    },
)

/**
 * Create a new message in a conversation
 */
export const createMessage = createServerFn({ method: 'POST' }).handler(
    async (ctx) => {
        const data = ctx.data as {
            conversationId: string
            role: 'user' | 'assistant'
            content: string
        }

        if (!data?.conversationId || !data?.role || !data?.content) {
            throw new Error('Conversation ID, role, and content are required')
        }

        const [newMessage] = await db
            .insert(messages)
            .values({
                conversationId: data.conversationId,
                role: data.role,
                content: data.content,
            })
            .returning()

        // Update conversation's updatedAt timestamp
        await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, data.conversationId))

        return newMessage
    },
)
