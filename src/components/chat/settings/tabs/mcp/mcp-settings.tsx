'use client'

import * as React from 'react'
import {
    RiAppsLine,
    RiCheckLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiDownload2Line,
    RiErrorWarningLine,
    RiFilter3Line,
    RiInformationLine,
    RiRefreshLine,
    RiSearchLine,
    RiToolsLine,
} from '@remixicon/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMCPManagement } from '@/hooks/use-mcp-management'
import { useMCPStore } from '@/lib/store/mcp-store'
import { MCPInstallDialog } from '@/components/mcp-ui/mcp-install-dialog'
import { TooltipIconButton } from '@/components/tooltip-icon-button'

export function MCPSettings() {
    const { enabledMCPs, addedMCPs, toggleMCP, addMCP, removeMCP, isAdded } =
        useMCPStore()
    const [search, setSearch] = React.useState('')
    const [activeTab, setActiveTab] = React.useState<'added' | 'catalog'>('added')
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
        null,
    )
    const [installDialog, setInstallDialog] = React.useState<{
        open: boolean
        mcp: any
        action: 'install' | 'uninstall'
    }>({ open: false, mcp: null, action: 'install' })

    const {
        mcpTools,
        isLoading,
        isInstalling,
        isUninstalling,
        error,
        refetch,
        installMCP: installMCPFn,
        uninstallMCP: uninstallMCPFn,
    } = useMCPManagement()

    // Get unique categories
    const categories = React.useMemo(() => {
        return Array.from(new Set(mcpTools.map((t) => t.category)))
    }, [mcpTools])

    // Filter tools based on active tab
    const filteredTools = React.useMemo(() => {
        let filtered = mcpTools.filter((tool) => {
            const matchesSearch =
                tool.name.toLowerCase().includes(search.toLowerCase()) ||
                tool.description.toLowerCase().includes(search.toLowerCase())

            const matchesCategory =
                !selectedCategory || tool.category === selectedCategory

            const baseFilter = matchesSearch && matchesCategory

            if (activeTab === 'added') {
                return baseFilter && isAdded(tool.id)
            }
            // Catalog tab shows all tools
            return baseFilter
        })

        return filtered
    }, [mcpTools, search, selectedCategory, activeTab, isAdded])

    const addedCount = addedMCPs.length
    const installedCount = mcpTools.filter((t) => t.isInstalled).length
    const enabledCount = Object.values(enabledMCPs).filter(Boolean).length

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <RiToolsLine className="size-6 text-primary" />
                    MCP Tools & Extensions
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage Model Context Protocol tools to extend AI capabilities
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold">{addedCount}</div>
                    <div className="text-xs text-muted-foreground">Added Tools</div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold">{installedCount}</div>
                    <div className="text-xs text-muted-foreground">Installed</div>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold text-primary">{enabledCount}</div>
                    <div className="text-xs text-muted-foreground">Active in Chat</div>
                </div>
            </div>

            {/* Connection Status */}
            {isLoading && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/30">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                        Loading MCP catalog...
                    </span>
                </div>
            )}

            {!isLoading && !error && (
                <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-700 dark:text-green-400">
                        Docker connected • {mcpTools.length} tools available
                    </span>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex items-start gap-3">
                        <RiErrorWarningLine className="size-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-destructive mb-1">
                                {error.message}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                                {error.helpfulMessage}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="h-7"
                            >
                                <RiRefreshLine className="size-3 mr-1" />
                                Retry Connection
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'added' | 'catalog')}
                className="flex-1 flex flex-col"
            >
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="added" className="gap-2">
                            <RiAppsLine className="size-4" />
                            My Tools
                            {addedCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                    {addedCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="catalog" className="gap-2">
                            <RiSearchLine className="size-4" />
                            Browse Catalog
                        </TabsTrigger>
                    </TabsList>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 gap-2 ${selectedCategory ? 'border-primary bg-primary/5' : ''}`}
                                >
                                    <RiFilter3Line className="size-3.5" />
                                    {selectedCategory || 'All Categories'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
                                        Filter by Category
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem
                                        checked={selectedCategory === null}
                                        onCheckedChange={() => setSelectedCategory(null)}
                                    >
                                        All Categories
                                    </DropdownMenuCheckboxItem>
                                    {categories.map((cat) => (
                                        <DropdownMenuCheckboxItem
                                            key={cat}
                                            checked={selectedCategory === cat}
                                            onCheckedChange={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="relative w-64">
                            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tools..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-8"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
                                >
                                    <RiCloseLine className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* My Tools Tab */}
                <TabsContent value="added" className="flex-1 mt-0">
                    <ScrollArea className="h-[400px]">
                        {filteredTools.length > 0 ? (
                            <div className="grid gap-3 pr-4">
                                {filteredTools.map((tool) => (
                                    <div
                                        key={tool.id}
                                        className="group p-4 rounded-lg border bg-card hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">{tool.name}</h4>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {tool.category}
                                                    </Badge>
                                                    {tool.isInstalled && (
                                                        <Badge variant="default" className="text-xs gap-1">
                                                            <RiCheckLine className="size-3" />
                                                            Installed
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {tool.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {tool.isInstalled ? (
                                                    <>
                                                        <TooltipIconButton
                                                            tooltip="Uninstall"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 text-destructive hover:text-destructive"
                                                            onClick={() =>
                                                                setInstallDialog({
                                                                    open: true,
                                                                    mcp: tool,
                                                                    action: 'uninstall',
                                                                })
                                                            }
                                                            disabled={isUninstalling}
                                                        >
                                                            <RiDeleteBinLine className="size-4" />
                                                        </TooltipIconButton>
                                                        <div className="flex items-center gap-2 pl-2 border-l">
                                                            <Label
                                                                htmlFor={`enable-${tool.id}`}
                                                                className="text-sm cursor-pointer"
                                                            >
                                                                Enable
                                                            </Label>
                                                            <Switch
                                                                id={`enable-${tool.id}`}
                                                                checked={enabledMCPs[tool.id] ?? false}
                                                                onCheckedChange={() => toggleMCP(tool.id)}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            setInstallDialog({
                                                                open: true,
                                                                mcp: tool,
                                                                action: 'install',
                                                            })
                                                        }
                                                        disabled={isInstalling}
                                                        className="gap-2"
                                                    >
                                                        <RiDownload2Line className="size-4" />
                                                        Install
                                                    </Button>
                                                )}

                                                <TooltipIconButton
                                                    tooltip="Remove from my tools"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => removeMCP(tool.id)}
                                                >
                                                    <RiCloseLine className="size-4" />
                                                </TooltipIconButton>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <RiAppsLine className="size-12 mb-3 text-muted-foreground opacity-50" />
                                <h3 className="font-medium mb-1">No tools added yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Browse the catalog to add tools to your collection
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveTab('catalog')}
                                    className="gap-2"
                                >
                                    <RiSearchLine className="size-4" />
                                    Browse Catalog
                                </Button>
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* Browse Catalog Tab */}
                <TabsContent value="catalog" className="flex-1 mt-0">
                    <ScrollArea className="h-[400px]">
                        {filteredTools.length > 0 ? (
                            <div className="grid gap-3 pr-4">
                                {filteredTools.map((tool) => {
                                    const added = isAdded(tool.id)
                                    return (
                                        <div
                                            key={tool.id}
                                            className={`group p-4 rounded-lg border transition-all ${added
                                                ? 'bg-primary/5 border-primary/30'
                                                : 'bg-card hover:border-primary/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold">{tool.name}</h4>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {tool.category}
                                                        </Badge>
                                                        {added && (
                                                            <Badge
                                                                variant="default"
                                                                className="text-xs gap-1 bg-primary"
                                                            >
                                                                <RiCheckLine className="size-3" />
                                                                Added
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {tool.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {added ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeMCP(tool.id)}
                                                            className="gap-2"
                                                        >
                                                            <RiCloseLine className="size-4" />
                                                            Remove
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => addMCP(tool.id)}
                                                            className="gap-2"
                                                        >
                                                            <RiCheckLine className="size-4" />
                                                            Add to My Tools
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <RiSearchLine className="size-12 mb-3 text-muted-foreground opacity-50" />
                                <h3 className="font-medium mb-1">No tools found</h3>
                                <p className="text-sm text-muted-foreground">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            {/* Footer Info */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                <div className="flex items-start gap-3">
                    <RiInformationLine className="size-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                        <p className="font-medium mb-1">How it works</p>
                        <ol className="text-muted-foreground space-y-1 text-xs list-decimal list-inside">
                            <li>
                                <strong>Add</strong> tools from the catalog to your collection
                            </li>
                            <li>
                                <strong>Install</strong> the Docker image for each tool
                            </li>
                            <li>
                                <strong>Enable</strong> tools to use them in your conversations
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Installation Dialog */}
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
                            return await installMCPFn(installDialog.mcp.id)
                        } else {
                            return await uninstallMCPFn(installDialog.mcp.id)
                        }
                    }}
                    isLoading={isInstalling || isUninstalling}
                />
            )}
        </div>
    )
}
