import type { ComponentProps } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChatHistory } from './ChatHistory'
import { AppHeader } from './AppHeader'

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar()
  return (
    <Sidebar
      variant="sidebar"
      collapsible="offcanvas"
      className="h-full"
      {...props}
    >
      <SidebarHeader className="border-b">
        <div className="flex items-center dark:bg-card dark:border-input/60 border-transparent border rounded-lg font-semibold">
          {open && <AppHeader />}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-1">
        <ChatHistory />
      </SidebarContent>
      <SidebarFooter>
        <div className="h-10 flex items-center text-sm">Ginger&trade;</div>
      </SidebarFooter>
    </Sidebar>
  )
}
