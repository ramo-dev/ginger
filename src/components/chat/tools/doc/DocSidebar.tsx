'use client'

import { useDoc } from '@/hooks/use-doc'
import { useDocSidebar } from '@/hooks/use-doc-sidebar'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import { Button } from '@/components/ui/button'
import {
  RiCheckLine,
  RiCloseLine,
  RiFileCopyLine,
  RiLoader4Line,
} from '@remixicon/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCopyToClipboard } from '../shared/use-copy-to-clipboard'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export default function DocSidebar() {
  const { documents, removeDocument } = useDoc()
  const { isOpen, isLoading, closeSidebar, documentContent, documentTitle } =
    useDocSidebar()
  const { open: mainSidebarOpen } = useSidebar()
  const { copy, copiedId } = useCopyToClipboard()

  const handleCopy = async (content: string | null) => {
    if (!content) return
    await copy(content, 'document-content')
  }

  const isCopied = copiedId === 'document-content'

  // Only show completed documents from the last 30 minutes
  const recentDocuments = documents.filter(
    (doc) => Date.now() - doc.timestamp < 30 * 60 * 1000,
  )

  if (recentDocuments.length === 0 && !isOpen && !isLoading) {
    return null
  }

  return (
    <div
      className={cn(
        mainSidebarOpen ? 'max-w-[650px]' : 'max-w-5xl',
        'h-full w-full bg-background z-50 transform transition-transform duration-300 ease-in-out',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg line-clamp-1 max-w-md text-wrap font-bold truncate font-black">
            {documentTitle}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon-sm"
            variant="ghost"
            className="bg-muted/50"
            onClick={() => handleCopy(documentContent)}
          >
            {isCopied ? <RiCheckLine /> : <RiFileCopyLine />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log('📋 [DOC SIDEBAR] Close button clicked')
              closeSidebar()
            }}
            className="h-8 w-8"
          >
            <RiCloseLine className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Focused Document */}
        {documentContent && documentTitle ? (
          <ScrollArea className="h-[calc(100vh-6rem)] px-4">
            <Message from="assistant" className="pt-4">
              <MessageContent>
                <MessageResponse>{documentContent}</MessageResponse>
              </MessageContent>
            </Message>
          </ScrollArea>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <RiLoader4Line className="w-6 h-6 animate-spin" />
            <span>Loading document...</span>
          </div>
        ) : (
          <span>No recent documents</span>
        )}
      </div>

      {/* Clear all button */}
      {recentDocuments.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('📋 [DOC SIDEBAR] Clear all button clicked')
              recentDocuments.forEach((doc) => removeDocument(doc.id))
            }}
            className="w-full"
          >
            Clear All Documents
          </Button>
        </div>
      )}
    </div>
  )
}

