import {
  RiBox2Line,
  RiArrowDownSLine,
  RiWebhookLine,
  RiSearchLine,
  RiCloseLine,
  RiCheckLine,
} from '@remixicon/react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useModelStore } from '@/lib/store/model-store'
import type { ModelProvider } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function ModelPopover() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { getAllModels, selectedModelId, setSelectedModel, isOllamaEnabled } =
    useModelStore()

  const models = getAllModels()
  const selectedModel = models.find((model) => model.id === selectedModelId)

  const handleSelect = (id: string, provider: ModelProvider) => {
    setSelectedModel(id, provider)
    setOpen(false)
  }

  const getProviderIcon = (provider: ModelProvider) => {
    switch (provider) {
      case 'ollama':
        return <RiBox2Line className="size-4" />
      case 'openrouter':
        return <RiWebhookLine className="size-4" />
      default:
        return <RiWebhookLine className="size-4" />
    }
  }

  const filteredModels = React.useMemo(() => {
    if (!search) return models
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.id.toLowerCase().includes(search.toLowerCase()),
    )
  }, [models, search])

  const openRouterModels = filteredModels.filter(
    (m) => m.provider === 'openrouter',
  )
  const ollamaModels = filteredModels.filter((m) => m.provider === 'ollama')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-8 dark:border border-0 border-input/60 justify-between px-3 dark:bg-transparent bg-muted/70 transition-all"
        >
          <span className="flex items-center gap-2 truncate">
            {selectedModel ? (
              <>
                <span className="text-muted-foreground">
                  {getProviderIcon(selectedModel.provider)}
                </span>
                <span className="truncate font-medium">
                  {selectedModel.name}
                </span>
              </>
            ) : (
              'Select model...'
            )}
          </span>
          <RiArrowDownSLine className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0 overflow-hidden shadow-xl border-border"
        align="start"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/10">
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-none flex items-center gap-2">
              <RiWebhookLine className="size-4 text-primary" />
              Model Selection
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Choose your AI model provider
            </p>
          </div>
          <Badge
            variant="outline"
            className="aspect-square font-mono font-medium px-2"
          >
            {models.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="px-2">
          <div className="relative group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search models..."
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

        {/* Model List */}
        <ScrollArea className="h-[320px]">
          <div className="pb-2">
            {/* OpenRouter Models */}
            {openRouterModels.length > 0 && (
              <div className="px-2 py-2">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <RiWebhookLine className="size-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    OpenRouter
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[9px] ml-auto"
                  >
                    {openRouterModels.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {openRouterModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelect(model.id, model.provider)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all',
                        'hover:bg-muted/50',
                        selectedModelId === model.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'border border-transparent',
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getProviderIcon(model.provider)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {model.name}
                        </div>
                      </div>
                      {selectedModelId === model.id && (
                        <RiCheckLine className="size-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ollama Models */}
            {isOllamaEnabled && ollamaModels.length > 0 && (
              <div className="px-2 py-2">
                {openRouterModels.length > 0 && (
                  <div className="h-px bg-border my-2" />
                )}
                <div className="flex items-center gap-2 mb-2 px-2">
                  <RiBox2Line className="size-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Ollama (Local)
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[9px] ml-auto"
                  >
                    {ollamaModels.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {ollamaModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelect(model.id, model.provider)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all',
                        'hover:bg-muted/50',
                        selectedModelId === model.id
                          ? 'bg-primary/10 border border-primary/30'
                          : 'border border-transparent',
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getProviderIcon(model.provider)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {model.name}
                        </div>
                      </div>
                      {selectedModelId === model.id && (
                        <RiCheckLine className="size-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredModels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                <RiSearchLine className="size-8 mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">No models found</p>
                <p className="text-xs text-muted-foreground">
                  Try a different search
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {selectedModel && (
          <div className="p-3 border-t bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-muted-foreground">
                {getProviderIcon(selectedModel.provider)}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground truncate">
                Currently using:{' '}
                <span className="text-foreground">{selectedModel.name}</span>
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

