import { createFileRoute } from '@tanstack/react-router'
import Assistant from '@/components/chat/layout/Assistant'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return <Assistant />
}

