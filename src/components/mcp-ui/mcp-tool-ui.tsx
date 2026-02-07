'use client'

import {
  RiAppsLine,
  RiCloseLine,
  RiInformationLine,
  RiRefreshLine,
  RiSearchLine,
  RiSettings4Line,
  RiToolsLine,
} from '@remixicon/react'
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useMCPManagement } from '@/hooks/use-mcp-management'
import { useMCPStore } from '@/lib/store/mcp-store'
import { TooltipIconButton } from '@/components/tooltip-icon-button'
import { useNavigate } from '@tanstack/react-router'

export function MCPToolPopover() {
  const { enabledMCPs, addedMCPs, toggleMCP, isAdded } = useMCPStore()
  const [search, setSearch] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()

  const { mcpTools, isLoading, error, refetch } = useMCPManagement()

  const enabledCount = Object.values(enabledMCPs).filter(Boolean).length
  const addedCount = addedMCPs.length

  // Filter to show ONLY added MCPs
  const filteredTools = React.useMemo(() => {
    // First filter to only added tools
    const addedTools = mcpTools.filter((tool) => isAdded(tool.id))

    // Then apply search filter
    if (!search) return addedTools

    return addedTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()),
    )
  }, [mcpTools, search, isAdded])

  // Separate into installed and not installed
  const installedTools = filteredTools.filter((t) => t.isInstalled)
  const notInstalledTools = filteredTools.filter((t) => !t.isInstalled)

  const handleOpenSettings = () => {
    setOpen(false)
    // Navigate to settings with MCP tab active
    // This assumes you have a settings route
    navigate({ to: '/settings', search: { tab: 'mcps' } })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <TooltipIconButton
          tooltip="MCP Tools"
          side="bottom"
          variant="ghost"
          size="icon"
          className="relative dark:border border-0 border-muted/80 size-8 rounded-xl hover:bg-muted transition-all active:scale-95"
          aria-label={`MCP Tools, ${enabledCount} active`}
        >
          <RiToolsLine className="size-5" />
          {enabledCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full border text-[10px] font-bold text-foreground ring-2 ring-background">
              {enabledCount}
            </span>
          )}
        </TooltipIconButton>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        className="w-[400px] p-0 overflow-hidden shadow-xl border-border"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/10">
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-none flex items-center gap-2">
              <RiAppsLine className="size-4 text-primary" />
              My MCP Tools
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {addedCount} tools • {enabledCount} active
            </p>
          </div>

          {error && (
            <TooltipIconButton
              tooltip="Retry loading"
              side="bottom"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => refetch()}
            >
              <RiRefreshLine className="size-3.5" />
            </TooltipIconButton>
          )}
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search your tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-8 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-background text-muted-foreground"
                aria-label="Clear search"
              >
                <RiCloseLine className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[320px]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-sm text-muted-foreground">
                Loading tools...
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 m-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <p className="text-xs text-destructive mb-2">{error.message}</p>
              <p className="text-xs text-muted-foreground">
                {error.helpfulMessage}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredTools.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <RiAppsLine className="size-12 mb-3 text-muted-foreground opacity-50" />
              <h4 className="font-medium mb-1 text-sm">
                {addedCount === 0 ? 'No tools added yet' : 'No tools found'}
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                {addedCount === 0
                  ? 'Add tools from settings to get started'
                  : 'Try adjusting your search'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSettings}
                className="gap-2"
              >
                <RiSettings4Line className="size-3.5" />
                Open Settings
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredTools.length > 0 && (
            <div className="space-y-2 p-3">
              {/* Installed Tools */}
              {installedTools.length > 0 && (
                <div className="space-y-2">
                  {installedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="group relative flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-all hover:border-primary/30 hover:bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label
                            htmlFor={`toggle-${tool.id}`}
                            className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors truncate"
                          >
                            {tool.name}
                          </Label>
                          <Badge
                            variant="secondary"
                            className="h-4 px-1.5 text-[9px] uppercase tracking-tight bg-muted-foreground/10 flex-shrink-0"
                          >
                            {tool.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
                          {tool.description}
                        </p>
                      </div>

                      <Switch
                        id={`toggle-${tool.id}`}
                        checked={enabledMCPs[tool.id] ?? false}
                        onCheckedChange={() => toggleMCP(tool.id)}
                        className="flex-shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Not Installed Tools */}
              {notInstalledTools.length > 0 && (
                <div className="space-y-2">
                  {installedTools.length > 0 && (
                    <div className="flex items-center gap-2 px-2 py-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Not Installed
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  {notInstalledTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="group relative flex items-center justify-between gap-3 rounded-lg border border-dashed border-muted p-3 opacity-60"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold truncate">
                            {tool.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-[9px] uppercase tracking-tight flex-shrink-0"
                          >
                            {tool.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        Install in settings
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-3.5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Toggle to enable/disable tools
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] gap-1 hover:bg-background"
            onClick={handleOpenSettings}
          >
            <RiSettings4Line className="size-3" />
            Manage
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
