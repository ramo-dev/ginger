import { createFileRoute } from '@tanstack/react-router'
import Assistant from '@/components/chat/layout/Assistant'
import { getMessages } from '@/server/get-messages'

export const Route = createFileRoute('/chat/$chatId')({
  loader: async ({ params }) => {
    const messages = await getMessages({ data: params.chatId })

    return { messages }
  },
  component: ChatRoute,
})

function ChatRoute() {
  const { chatId } = Route.useParams()
  const { messages } = Route.useLoaderData()

  return <Assistant chatId={chatId} initialMessages={messages} />
}
