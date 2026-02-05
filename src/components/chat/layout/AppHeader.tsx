import { SidebarTrigger } from '@/components/ui/sidebar'
import { SettingsDialog } from '../settings/settings-dialog'

export const AppHeader = () => {
  return (
    <header className="flex items-center justify-between px-4 min-h-16 max-h-18 border-b bg-background z-10 flex-1">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2">
        <SettingsDialog />
      </div>
    </header>
  )
}
