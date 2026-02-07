import { createFileRoute } from '@tanstack/react-router'
import Assistant from '@/components/chat/layout/Assistant'
import { SidebarProvider } from '@/components/ui/sidebar'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="h-screen overflow-x-hidden flex flex-col">
      <SidebarProvider
        className="flex-1 min-h-0 relative"
        style={
          {
            '--sidebar-width': '16rem',
          } as React.CSSProperties
        }
      >
        <Assistant />
      </SidebarProvider>
    </div>
  )
}
