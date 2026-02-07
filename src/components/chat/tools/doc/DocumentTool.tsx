import { Button } from '@/components/ui/button'
import {
  RiDownload2Line,
  RiFileCopyLine,
  RiCheckLine,
  RiExpandDiagonalLine,
  RiLoader4Line,
} from '@remixicon/react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { ToolUIPart } from 'ai'
import { Card, CardContent } from '@/components/ui/card'
import { useDocSidebar } from '@/hooks/use-doc-sidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export interface DocumentToolProps {
  input: {
    title: string
    content: string
    fileType: 'txt' | 'md' | 'docx' | 'pdf' | 'html'
  }
  output?: {
    id: string
    title: string
    content: string
    fileType: string
    downloadUrl?: string
    success: boolean
  }
  errorText?: string
  state: ToolUIPart['state']
  type: 'tool-createDocument' | 'tool-editDocument'
}

export function DocumentTool({ output, errorText, state }: DocumentToolProps) {
  const [copied, setCopied] = useState(false)
  const { openSidebar, setLoading, isOpen } = useDocSidebar()
  const { setOpen: setOpenMainSidebar } = useSidebar()

  // Debug logging to help identify the issue

  // Open sidebar when streaming starts
  useEffect(() => {
    if (state === 'input-streaming') {
      openSidebar(output?.id)
      setLoading(true)
    } else if (state === 'output-available' && output) {
      setLoading(false)
    }
  }, [state, output, openSidebar, setLoading])

  const handleCopy = async (content: string) => {
    if (!content) return
    await navigator.clipboard.writeText(content)
    toast.success('Copied to Clipboard')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleViewDocument = () => {
    if (output?.id && output?.content) {
      setOpenMainSidebar(false)
      openSidebar(output.id, output.content, output.title, output.fileType)
    }
  }

  const handleDownload = () => {
    if (!output) return

    if (output.downloadUrl) {
      window.open(output.downloadUrl, '_blank')
    } else if (output.content) {
      const blob = new Blob([output.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${output.title || 'document'}.${output.fileType || 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄'
      case 'docx':
        return '📝'
      case 'md':
        return '📋'
      case 'html':
        return '🌐'
      default:
        return '📄'
    }
  }

  const renderDocumentContent = () => {
    if (!output) return null

    // Defensive checks for output properties
    const safeOutput = {
      ...output,
      title: output.title || 'Document',
      content: output.content || '',
      fileType: output.fileType || 'txt',
    }

    return (
      <div className="space-y-4 flex-1 w-full">
        {/* Document Header */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFileIcon(safeOutput.fileType)}</span>
            <div>
              <div className="font-medium text-sm">{safeOutput.title}</div>
              <div className="text-xs text-muted-foreground">
                {safeOutput.fileType.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(safeOutput.content)}
              title="Copy to clipboard"
            >
              {copied ? (
                <RiCheckLine className="w-4 h-4 text-green-600" />
              ) : (
                <RiFileCopyLine className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download document"
            >
              <RiDownload2Line className="w-4 h-4" />
            </Button>
            {isOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleViewDocument}
                title="View document"
              >
                <RiExpandDiagonalLine className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (state === 'input-streaming') {
    return (
      <Card className="relative p-4 gap-4 w-full my-4 border">
        <div className="flex items-center text-muted-foreground gap-3">
          <div className="animate-spin">
            <RiLoader4Line className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base">Generating Document</h3>
          </div>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-[85%] rounded-full bg-muted animate-pulse" />
          <Skeleton className="h-4 w-[90%] rounded-full bg-muted animate-pulse delay-150" />
        </div>
      </Card>
    )
  }

  return (
    <Card
      onClick={handleViewDocument}
      className="border my-4 cursor-pointer p-0 flex-1"
    >
      <CardContent className="w-full px-0">
        {state === 'output-available' && renderDocumentContent()}
        {errorText && (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Error
            </h4>
            <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm">
              {errorText}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
