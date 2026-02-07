import { useEffect, useRef, useState } from 'react'
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { SettingsDialog } from '../settings/settings-dialog'
import { cn } from '@/lib/utils'
import Logo from '@/components/assets/Logo'

export const AppHeader = ({ className }: { className?: string }) => {
  const { open: sidebarOpen } = useSidebar()

  const [unfolded, setUnfolded] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAutoClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const startAutoClose = () => {
    clearAutoClose()
    timeoutRef.current = setTimeout(() => {
      setUnfolded(false)
    }, 1000)
  }

  useEffect(() => {
    if (!sidebarOpen) {
      setUnfolded(true)
      startAutoClose()
    } else {
      clearAutoClose()
    }
  }, [sidebarOpen])

  useEffect(() => {
    return () => clearAutoClose()
  }, [])

  const actuallyUnfolded = sidebarOpen || unfolded

  return (
    <header
      className={cn(
        className,
        'group z-10 m-1 flex items-center rounded-xl backdrop-blur-md transition-all duration-300',
        sidebarOpen
          ? 'relative justify-between w-full! shadow-none! border-none!'
          : 'fixed top-2 left-3 p-0.5',
        actuallyUnfolded
          ? 'bg-card/40 w-fit cursor-pointer shadow-lg border border-border/20'
          : 'bg-card/20 shadow-sm border border-input/5',
      )}
      onMouseEnter={() => {
        if (!sidebarOpen) {
          clearAutoClose()
          setUnfolded(true)
        }
      }}
      onMouseLeave={() => {
        if (!sidebarOpen) {
          startAutoClose()
        }
      }}
    >
      <Logo
        className="text-foreground dark:invert"
        width={sidebarOpen ? '30' : '35'}
        height={sidebarOpen ? '35' : '35'}
      />

      <div
        className={cn(
          'flex items-center transition-all duration-300',
          sidebarOpen ? 'gap-2' : '',
          actuallyUnfolded
            ? 'opacity-100 max-w-50 ml-2'
            : 'opacity-0 max-w-0 overflow-hidden',
        )}
      >
        <SidebarTrigger />
        <SettingsDialog />
      </div>
    </header>
  )
}
