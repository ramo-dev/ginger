import { Link } from '@tanstack/react-router'
import { RiMessage2Line, RiInboxLine } from '@remixicon/react'
import { useEffect, useState } from 'react'
import { getConversations } from '@/lib/api/conversations'
import type { Conversation } from '@/db/schema'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function ChatHistory() {
  const [history, setHistory] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getConversations()
      .then(setHistory)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-muted rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Recent Chats
      </div>
      {history.length === 0 ? (
        <Empty className="p-4 border-none my-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <RiInboxLine />
            </EmptyMedia>
            <EmptyTitle className="text-sm">No chats found</EmptyTitle>
            <EmptyDescription className="text-xs">
              Start a new conversation to see it here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        history.map((chat) => (
          <Link
            key={chat.id}
            to="/chat/$chatId"
            params={{ chatId: chat.id }}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors truncate"
            activeProps={{
              className: 'bg-accent text-accent-foreground font-medium',
            }}
          >
            <RiMessage2Line className="size-4 shrink-0" />
            <span className="truncate">{chat.title || 'Untitled'}</span>
          </Link>
        ))
      )}
    </div>
  )
}
