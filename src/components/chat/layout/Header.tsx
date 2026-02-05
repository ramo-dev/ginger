import Logo from '@/components/assets/Logo'
import { ThreadListNew } from '@/components/assistant-ui/thread-list'
import { ModelPopover } from '../model-popover'
import { SettingsDialog } from '../settings/settings-dialog'

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 h-18 border-b bg-background z-10">
      <div className="flex items-center font-semibold">
        <Logo width="40" height="40" />
        Ginger
      </div>
      <div className="flex items-center gap-2">
        <ModelPopover />
        <SettingsDialog />
        <ThreadListNew
          variant="outline"
          size="icon"
          className="rounded-full justify-center"
        />
      </div>
    </header>
  )
}
