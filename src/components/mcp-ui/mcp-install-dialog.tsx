import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  RiDownload2Line,
  RiDeleteBinLine,
  RiErrorWarningLine,
  RiCheckLine,
} from '@remixicon/react'

interface MCPInstallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mcp: {
    id: string
    name: string
    description: string
    category: string
    version?: string
  } | null
  action: 'install' | 'uninstall'
  onConfirm: () => Promise<{ success: boolean; message: string }>
  isLoading?: boolean
}

export function MCPInstallDialog({
  open,
  onOpenChange,
  mcp,
  action,
  onConfirm,
  isLoading = false,
}: MCPInstallDialogProps) {
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Early return if mcp is null
  if (!mcp) {
    return null
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    setResult(null)
    
    try {
      const response = await onConfirm()
      setResult(response)
      
      // Auto-close on success after a delay
      if (response.success) {
        setTimeout(() => {
          onOpenChange(false)
          setResult(null)
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      setResult(null)
    }
  }

  const isInstall = action === 'install'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isInstall ? (
              <RiDownload2Line className="size-5 text-primary" />
            ) : (
              <RiDeleteBinLine className="size-5 text-destructive" />
            )}
            {isInstall ? 'Install MCP' : 'Uninstall MCP'}
          </DialogTitle>
          <DialogDescription>
            {isInstall 
              ? `Install "${mcp.name}" to extend AI capabilities with ${mcp.category.toLowerCase()} tools.`
              : `Remove "${mcp.name}" from your system. This will uninstall the MCP server.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* MCP Details */}
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{mcp.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {mcp.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {mcp.description}
            </p>
            {mcp.version && (
              <p className="text-xs font-mono text-muted-foreground">
                Version: {mcp.version}
              </p>
            )}
          </div>

          {/* Loading Progress */}
          {(isSubmitting || isLoading) && (
            <div className="space-y-2">
              <Progress value={isSubmitting ? 50 : 100} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {isSubmitting 
                  ? `${isInstall ? 'Installing' : 'Uninstalling'} ${mcp.name}...`
                  : 'Processing...'
                }
              </p>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              result.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result.success ? (
                <RiCheckLine className="size-4 flex-shrink-0" />
              ) : (
                <RiErrorWarningLine className="size-4 flex-shrink-0" />
              )}
              <p className="text-xs leading-relaxed">
                {result.message}
              </p>
            </div>
          )}

          {/* Warning for uninstall */}
          {isInstall === false && !result && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <RiErrorWarningLine className="size-4 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium mb-1">Warning</p>
                <p className="leading-relaxed">
                  This will remove the MCP server from your system. Any active connections will be terminated.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isLoading}
          >
            {result?.success ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || isLoading}
              variant={isInstall ? 'default' : 'destructive'}
            >
              {isSubmitting || isLoading
                ? `${isInstall ? 'Installing' : 'Uninstalling'}...`
                : isInstall 
                  ? 'Install' 
                  : 'Uninstall'
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
