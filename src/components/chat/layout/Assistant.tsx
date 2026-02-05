import { useState, useEffect } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import DocSidebar from '../tools/doc/DocSidebar'
import ChatLayout from './ChatLayout'
import { useDocSidebar } from '@/hooks/use-doc-sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

const Assistant = () => {
  const { isOpen, documentContent } = useDocSidebar();
  const [chatSize, setChatSize] = useState(100);
  const [docSize, setDocSize] = useState(0);

  useEffect(() => {
    if (isOpen && documentContent) {
      setChatSize(60);
      setDocSize(40);
    } else {
      setChatSize(100);
      setDocSize(0);
    }
  }, [isOpen, documentContent]);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <SidebarProvider
        className="flex-1 min-h-0 relative"
        style={
          {
            '--sidebar-width': '15rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            <AppHeader />
            <ResizablePanelGroup 
              className='flex h-full w-full'
            >
              <ResizablePanel 
                defaultSize={chatSize}
                minSize={30} 
                className='mx-2 transition-all duration-300 ease-in-out'
              >
                <ChatLayout/>
              </ResizablePanel>
              
              {isOpen && documentContent && (
                <>
                  <ResizableHandle withHandle className="transition-opacity duration-300"/>
                  <ResizablePanel 
                    defaultSize={docSize}
                    minSize={20}
                    className="transition-all duration-300 ease-in-out"
                  >
                    <DocSidebar/>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup> 
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default Assistant