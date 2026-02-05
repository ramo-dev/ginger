import {
  RiAppsLine,
  RiCloseLine,
  RiDownload2Line,
  RiFilter3Line,
  RiInformationLine,
  RiRefreshLine,
  RiSearchLine,
  RiSettings4Line,
  RiSortAsc,
  RiSortDesc,
  RiToolsLine,
  RiErrorWarningLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiExternalLinkLine,
} from '@remixicon/react'
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useMCPManagement } from '@/hooks/use-mcp-management'
import { useMCPStore } from '@/lib/store/mcp-store'
import { MCPInstallDialog } from './mcp-install-dialog'
import { TooltipIconButton } from '@/components/tooltip-icon-button'
import { Button } from '@/components/ui/button'

export function MCPToolPopover() {
  const { enabledMCPs, toggleMCP } = useMCPStore()
  const [search, setSearch] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('all')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null,
  )
  const [sortBy, setSortBy] = React.useState<'name' | 'category' | 'status'>(
    'name',
  )
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 12
  const [installDialog, setInstallDialog] = React.useState<{
    open: boolean
    mcp: any
    action: 'install' | 'uninstall'
  }>({ open: false, mcp: null, action: 'install' })

  const {
    mcpTools,
    status,
    isLoading,
    isInstalling,
    isUninstalling,
    error,
    refetch,
    installMCP,
    uninstallMCP,
  } = useMCPManagement()

  // Dynamically get unique categories
  const categories = React.useMemo(() => {
    return Array.from(new Set(mcpTools.map((t) => t.category)))
  }, [mcpTools])

  const enabledCount = Object.values(enabledMCPs).filter(Boolean).length

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategory, sortBy, sortOrder, activeTab])

  const filteredTools = React.useMemo(() => {
    let filtered = mcpTools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase())

      const isEnabled = !!enabledMCPs[tool.id]
      const isInstalled = tool.isInstalled
      const matchesCategory =
        !selectedCategory || tool.category === selectedCategory

      const baseFilter = matchesSearch && matchesCategory

      if (activeTab === 'installed') return baseFilter && isInstalled
      if (activeTab === 'enabled') return baseFilter && isEnabled
      return baseFilter
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'status':
          // Installed items come first
          if (a.isInstalled && !b.isInstalled) comparison = -1
          else if (!a.isInstalled && b.isInstalled) comparison = 1
          else comparison = a.name.localeCompare(b.name)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [
    mcpTools,
    search,
    enabledMCPs,
    activeTab,
    selectedCategory,
    sortBy,
    sortOrder,
  ])

  // Pagination
  const paginatedTools = React.useMemo(() => {
    if (error) return []
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTools.slice(startIndex, endIndex)
  }, [filteredTools, currentPage, itemsPerPage, error])

  const totalPages = Math.ceil(filteredTools.length / itemsPerPage)

  return (
    <Popover>
      <PopoverTrigger>
        <TooltipIconButton
          tooltip="Manage MCP Extensions"
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
        className="w-lg p-0 overflow-hidden shadow-xl border-border"
        align="end"
        sideOffset={8}
      >
        {/* Header: Fixed */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/10">
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-none flex items-center gap-2">
              <RiAppsLine className="size-4 text-primary" />
              Tool Extensions
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Extend AI capabilities with MCP
            </p>
            {isLoading && (
              <div className="flex items-center gap-2">
                <Progress value={50} className="h-1 flex-1" />
                <span className="text-[10px] text-muted-foreground">
                  Loading...
                </span>
              </div>
            )}
            {!isLoading && !error && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[10px] text-green-600">
                  Docker connected
                </span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-1.5 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-[10px]">{error.message}</span>
              </div>
            )}
          </div>

          {/* Category Filter + Count + Sort */}
          <div className="flex items-center gap-2">
            {error && (
              <TooltipIconButton
                tooltip="Retry loading catalog"
                side="bottom"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => refetch()}
              >
                <RiRefreshLine className="size-3.5" />
              </TooltipIconButton>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[10px] gap-1.5"
                >
                  {sortOrder === 'asc' ? (
                    <RiSortAsc className="size-3" />
                  ) : (
                    <RiSortDesc className="size-3" />
                  )}
                  {sortBy === 'name'
                    ? 'Name'
                    : sortBy === 'category'
                      ? 'Category'
                      : 'Status'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] uppercase text-muted-foreground">
                    Sort By
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={sortBy === 'name'}
                    onCheckedChange={() => setSortBy('name')}
                    className="text-xs"
                  >
                    Name
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortBy === 'category'}
                    onCheckedChange={() => setSortBy('category')}
                    className="text-xs"
                  >
                    Category
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortBy === 'status'}
                    onCheckedChange={() => setSortBy('status')}
                    className="text-xs"
                  >
                    Status
                  </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === 'asc'}
                    onCheckedChange={() => setSortOrder('asc')}
                    className="text-xs"
                  >
                    <RiSortAsc className="size-3 mr-1" />
                    Ascending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={sortOrder === 'desc'}
                    onCheckedChange={() => setSortOrder('desc')}
                    className="text-xs"
                  >
                    <RiSortDesc className="size-3 mr-1" />
                    Descending
                  </DropdownMenuCheckboxItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 px-2 text-[10px] gap-1.5 ${selectedCategory ? 'border-primary bg-primary/5' : ''}`}
                >
                  <RiFilter3Line className="size-3" />
                  {selectedCategory || 'Categories'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] uppercase text-muted-foreground">
                    Filter by Category
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedCategory === null}
                    onCheckedChange={() => setSelectedCategory(null)}
                    className="text-xs"
                  >
                    All Categories
                  </DropdownMenuCheckboxItem>
                  {categories.map((cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat}
                      checked={selectedCategory === cat}
                      onCheckedChange={() => setSelectedCategory(cat)}
                      className="text-xs"
                    >
                      {cat}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="outline" className="h-7 font-mono font-medium px-2">
              {enabledCount}/{mcpTools.length}
            </Badge>
          </div>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          {/* ... (TabsList and Search Input remain same) ... */}
          <div className="px-4 pt-3 space-y-3">
            <TabsList className="grid w-full grid-cols-3 h-9 bg-muted/50">
              <TabsTrigger value="all" className="text-xs">
                All Tools
              </TabsTrigger>
              <TabsTrigger value="installed" className="text-xs">
                Installed
                <Badge className="ml-2 h-4 min-w-4 px-1 bg-primary/20 text-primary border-transparent hover:bg-primary/20">
                  {mcpTools.filter((t) => t.isInstalled).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="enabled" className="text-xs">
                Active
                {enabledCount > 0 && (
                  <Badge className="ml-2 h-4 min-w-4 px-1 bg-primary/20 text-primary border-transparent hover:bg-primary/20">
                    {enabledCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="relative group">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Find a tool..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-8 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
              />
              {(search || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory(null)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-background text-muted-foreground"
                  aria-label="Clear filters"
                >
                  <RiCloseLine className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-2 outline-none">
            <ScrollArea className="h-[320px] px-4">
              {/* Error Display */}
              {error && (
                <div className="mb-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <RiErrorWarningLine className="size-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-destructive mb-1">
                        {error.message}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {error.helpfulMessage}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                          <span>Docker connection failed</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          • Auto-refresh disabled
                        </div>
                      </div>

                      {error.documentationUrl && (
                        <a
                          href={error.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mb-3"
                        >
                          <span>View Docker MCP Setup Guide</span>
                          <RiExternalLinkLine className="size-3" />
                        </a>
                      )}

                      {error.type === 'docker_not_running' && (
                        <div className="mt-3 p-2 rounded bg-background/50 border">
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Quick steps to fix:</strong>
                          </p>
                          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>
                              Start Docker Desktop from your Applications folder
                            </li>
                            <li>
                              Wait for Docker to fully start (green status
                              indicator)
                            </li>
                            <li>Click the refresh button above to reconnect</li>
                          </ol>
                        </div>
                      )}

                      {error.type === 'docker_not_installed' && (
                        <div className="mt-3 p-2 rounded bg-background/50 border">
                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Quick steps to fix:</strong>
                          </p>
                          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Download and install Docker Desktop</li>
                            <li>Restart your computer after installation</li>
                            <li>
                              Start Docker Desktop and wait for it to initialize
                            </li>
                            <li>Click the refresh button above to reconnect</li>
                          </ol>
                        </div>
                      )}

                      <div className="mt-3 p-2 rounded bg-primary/5 border border-primary/20">
                        <p className="text-xs text-primary mb-2">
                          <strong>Note:</strong> Once Docker is running, the
                          catalog will refresh automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 pb-4 grid md:grid-cols-2 grid-cols-1 gap-2">
                {!error && paginatedTools.length > 0 ? (
                  paginatedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="group relative h-full flex flex-col gap-2 rounded-xl border border-border p-3 transition-all hover:border-primary/30 hover:bg-muted/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <Label
                            htmlFor={`toggle-${tool.id}`}
                            className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors"
                          >
                            {tool.name}
                          </Label>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[9px] uppercase tracking-tight bg-muted-foreground/10"
                            >
                              {tool.category}
                            </Badge>
                            {tool.isInstalled && (
                              <Badge
                                variant="default"
                                className="h-4 px-1.5 text-[9px] uppercase tracking-tight"
                              >
                                <RiCheckLine className="size-2.5 mr-0.5" />
                                {tool.installStatus || 'installed'}
                              </Badge>
                            )}
                            {tool.version && (
                              <span className="text-[9px] text-muted-foreground font-mono">
                                v{tool.version}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {tool.isInstalled ? (
                            <TooltipIconButton
                              tooltip="Uninstall MCP"
                              side="bottom"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-destructive hover:text-destructive"
                              onClick={() =>
                                setInstallDialog({
                                  open: true,
                                  mcp: tool,
                                  action: 'uninstall',
                                })
                              }
                              disabled={isUninstalling}
                            >
                              <RiDeleteBinLine className="size-3.5" />
                            </TooltipIconButton>
                          ) : (
                            <TooltipIconButton
                              tooltip="Install MCP"
                              side="bottom"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-primary hover:text-primary"
                              onClick={() =>
                                setInstallDialog({
                                  open: true,
                                  mcp: tool,
                                  action: 'install',
                                })
                              }
                              disabled={isInstalling}
                            >
                              <RiDownload2Line className="size-3.5" />
                            </TooltipIconButton>
                          )}
                          <Switch
                            id={`toggle-${tool.id}`}
                            checked={enabledMCPs[tool.id] ?? false}
                            onCheckedChange={() => toggleMCP(tool.id)}
                            disabled={!tool.isInstalled}
                          />
                        </div>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground leading-snug">
                        {tool.description}
                      </p>
                      {!tool.isInstalled && (
                        <p className="text-[10px] text-muted-foreground italic">
                          Install this MCP to enable it
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-60 col-span-full">
                    <RiSearchLine className="size-8 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">No tools found</p>
                    <p className="text-xs">Adjust search or check filters</p>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-7 w-7 p-0 text-xs"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs"
                  >
                    Next
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer remains same */}
        <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-3.5 text-primary" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Changes apply instantly
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] gap-1 hover:bg-background"
          >
            <RiSettings4Line className="size-3" />
            Registry Settings
          </Button>
        </div>
      </PopoverContent>

      {/* Installation/Uninstallation Dialog */}
      {installDialog.mcp && (
        <MCPInstallDialog
          open={installDialog.open}
          onOpenChange={(open) =>
            setInstallDialog((prev) => ({ ...prev, open }))
          }
          mcp={installDialog.mcp}
          action={installDialog.action}
          onConfirm={async () => {
            if (installDialog.action === 'install') {
              return await installMCP(installDialog.mcp.id)
            } else {
              return await uninstallMCP(installDialog.mcp.id)
            }
          }}
          isLoading={isInstalling || isUninstalling}
        />
      )}
    </Popover>
  )
}
