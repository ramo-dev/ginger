import type { ComponentProps } from 'react'
import Logo from '@/components/assets/Logo'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar'

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      className="h-full border-r bg-muted/20"
      {...props}
    >
      <SidebarHeader className="border-b">
        <div className="flex items-center p-1.5 dark:bg-card dark:border-input/60 border-transparent border bg-primary/5 rounded-lg font-semibold">
          <Logo width="40" height="40" />
          Ginger
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ThreadList />
      </SidebarContent>
    </Sidebar>
  )
}
