import { useState, useEffect } from 'react'
import { SidebarInset, useSidebar } from '@/components/ui/sidebar'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import DocSidebar from '../tools/doc/DocSidebar'
import ChatLayout from './ChatLayout'
import { useDocSidebar } from '@/hooks/use-doc-sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { cn } from '@/lib/utils'

const Assistant = () => {
  const { isOpen, documentContent } = useDocSidebar()
  const { open: sidebarOpen } = useSidebar()
  const [chatSize, setChatSize] = useState(100)
  const [docSize, setDocSize] = useState(0)

  useEffect(() => {
    if (isOpen && documentContent) {
      setChatSize(50)
      setDocSize(50)
    } else {
      setChatSize(100)
      setDocSize(0)
    }
  }, [isOpen, documentContent])

  return (
    <>
      <AppSidebar variant={sidebarOpen ? 'inset' : 'sidebar'} />
      {!sidebarOpen && <AppHeader />}
      <SidebarInset>
        <main className={cn(sidebarOpen ? "border" : "","flex-1 flex flex-col min-w-0 overflow-hidden w-full mx-auto rounded-xl")}>
          <ResizablePanelGroup className="flex h-full w-full">
            <ResizablePanel
              defaultSize={chatSize}
              minSize={30}
              className="mx-2 transition-all duration-300 ease-in-out"
            >
              <ChatLayout />
            </ResizablePanel>

            {isOpen && documentContent && (
              <>
                <ResizableHandle
                  withHandle
                  className="transition-opacity duration-300"
                />
                <ResizablePanel
                  defaultSize={docSize}
                  minSize={5}
                  className="transition-all duration-300 ease-in-out"
                >
                  <DocSidebar />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>
      </SidebarInset>
    </>
  )
}

export default Assistant

