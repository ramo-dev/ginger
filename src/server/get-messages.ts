// lib/server/messages.ts
import { db } from '@/db'
import { messages as messagesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createServerFn } from '@tanstack/react-start'

export const getMessages = createServerFn({ method: 'GET' })
  .inputValidator((chatId: string) => chatId) // ✅ Correct
  .handler(async ({ data: chatId }) => {
    const chatMessages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, chatId))

    return chatMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }))
  })
