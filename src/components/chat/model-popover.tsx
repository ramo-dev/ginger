import {
  RiBox2Line,
  RiArrowDownSLine,
  RiWebhookLine,
  RiSearchLine,
  RiCloseLine,
  RiBrainLine,
  RiToolsLine,
  RiFlashlightLine,
  RiRouteLine,
  RiCodeLine,
} from '@remixicon/react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useModelStore } from '@/lib/store/model-store'
import {
  CAPABILITY_CONFIG,
  type Model,
  type ModelProvider,
} from '@/lib/constants'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import {
  Field,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldContent,
} from '../ui/field'
import { TooltipIconButton } from '../tooltip-icon-button'

export function ModelPopover() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const { getAllModels, selectedModelId, setSelectedModel, isOllamaEnabled } =
    useModelStore()

  const models = getAllModels()
  const selectedModel = models.find((model) => model.id === selectedModelId)

  const handleSelect = (id: string) => {
    const model = models.find((m) => m.id === id)
    if (model) {
      setSelectedModel(id, model.provider)
      setOpen(false)
    }
  }

  const getProviderIcon = (provider: ModelProvider) => {
    switch (provider) {
      case 'ollama':
        return <RiBox2Line className="size-4" />
      case 'openrouter':
        return <RiRouteLine className="size-4" />
      default:
        return <RiWebhookLine className="size-4" />
    }
  }

  const getSpeedColor = (speed: 'fast' | 'medium' | 'slow') => {
    switch (speed) {
      case 'fast':
        return 'text-emerald-500'
      case 'medium':
        return 'text-amber-500'
      case 'slow':
        return 'text-rose-500'
    }
  }

  // Comprehensive search across multiple fields
  const filteredModels = React.useMemo(() => {
    if (!search) return models

    const searchLower = search.toLowerCase()

    return models.filter((model) => {
      // Search by name and ID
      const matchesBasic =
        model.name.toLowerCase().includes(searchLower) ||
        model.id.toLowerCase().includes(searchLower)

      // Search by description
      const matchesDescription = model.description
        ?.toLowerCase()
        .includes(searchLower)

      // Search by provider
      const matchesProvider = model.provider.toLowerCase().includes(searchLower)

      // Search by capabilities
      const matchesCapabilities =
        (searchLower.includes('reason') && model.capabilities?.reasoning) ||
        (searchLower.includes('tool') && model.capabilities?.toolCall) ||
        (searchLower.includes('fast') &&
          model.capabilities?.speed === 'fast') ||
        (searchLower.includes('slow') &&
          model.capabilities?.speed === 'slow') ||
        (searchLower.includes('medium') &&
          model.capabilities?.speed === 'medium') ||
        (searchLower.includes('vision') && model.capabilities?.vision) ||
        (searchLower.includes('code') && model.capabilities?.coding)

      return (
        matchesBasic ||
        matchesDescription ||
        matchesProvider ||
        matchesCapabilities
      )
    })
  }, [models, search])

  const openRouterModels = filteredModels.filter(
    (m) => m.provider === 'openrouter',
  )
  const ollamaModels = filteredModels.filter((m) => m.provider === 'ollama')

  const ModelCapabilityIcons = ({ model }: { model: Model }) => {
    if (!model.capabilities) return null

    return (
      <div className="flex items-center gap-1 mt-1.5">
        {(
          Object.entries(CAPABILITY_CONFIG) as [
            keyof typeof CAPABILITY_CONFIG,
            any,
          ][]
        ).map(([key, config]) => {
          if (!model.capabilities[key]) return null

          const Icon = config.icon
          return (
            <TooltipIconButton
              key={key}
              tooltip={config.label}
              side="top"
              className={`h-auto w-auto p-1 rounded ${config.color} mx-0`}
            >
              <Icon className="size-3" />
            </TooltipIconButton>
          )
        })}

        <TooltipIconButton
          tooltip={`Speed: ${model.capabilities.speed}`}
          side="top"
          className={`h-auto w-auto p-1 rounded bg-muted ${getSpeedColor(model.capabilities.speed)}`}
        >
          <RiFlashlightLine className="size-3" />
        </TooltipIconButton>
      </div>
    )
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-8 dark:border border-0 border-input/60 justify-between px-3 dark:bg-transparent bg-muted/70 transition-all hover:bg-muted"
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
        className="max-w-xl w-full p-0 overflow-hidden shadow-xl border-border"
        align="start"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-none flex items-center gap-2">
              <RiWebhookLine className="size-4 text-primary" />
              Model Selection
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Choose your AI model with specific capabilities
            </p>
          </div>
          <Badge
            variant="outline"
            className="aspect-square font-mono font-medium px-2 bg-background"
          >
            {models.length}
          </Badge>
        </div>

        {/* Search */}
        <div className="px-3 bg-muted/20">
          <div className="relative group">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search by name, capability, or speed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-10 pr-10 text-sm bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50 placeholder:text-muted-foreground/60"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Model List */}
        <ScrollArea className="h-[300px]">
          <div className="px-3">
            {/* OpenRouter Models */}
            {openRouterModels.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 p-2">
                  <RiWebhookLine className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    OpenRouter
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-5 px-2 text-[10px] ml-auto font-mono"
                  >
                    {openRouterModels.length}
                  </Badge>
                </div>
                <RadioGroup
                  value={selectedModelId}
                  onValueChange={handleSelect}
                  className="grid gap-2 grid-cols-2"
                >
                  {openRouterModels.map((model) => (
                    <FieldLabel
                      key={model.id}
                      className="cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Field orientation="horizontal" className="p-3 gap-3">
                        <FieldContent className="flex-1 min-w-0">
                          <FieldTitle className="flex items-center gap-2 text-sm">
                            {getProviderIcon(model.provider)}
                            <span className="font-semibold truncate">
                              {model.name}
                            </span>
                          </FieldTitle>
                          {model.description && (
                            <FieldDescription className="text-xs mt-1 line-clamp-1">
                              {model.description}
                            </FieldDescription>
                          )}
                          <ModelCapabilityIcons model={model} />
                        </FieldContent>
                        <RadioGroupItem
                          value={model.id}
                          id={model.id}
                          className="shrink-0"
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Ollama Models */}
            {isOllamaEnabled && ollamaModels.length > 0 && (
              <div>
                {openRouterModels.length > 0 && (
                  <div className="h-px bg-border mb-4" />
                )}
                <div className="flex items-center gap-2 mb-3 px-2">
                  <RiBox2Line className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ollama (Local)
                  </span>
                  <Badge
                    variant="secondary"
                    className="h-5 px-2 text-[10px] ml-auto font-mono"
                  >
                    {ollamaModels.length}
                  </Badge>
                </div>
                <RadioGroup
                  value={selectedModelId}
                  onValueChange={handleSelect}
                  className="grid gap-2 grid-cols-2"
                >
                  {ollamaModels.map((model) => (
                    <FieldLabel
                      key={model.id}
                      className="cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <Field orientation="horizontal" className="p-3 gap-3">
                        <FieldContent className="flex-1 min-w-0">
                          <FieldTitle className="flex items-center gap-2 text-sm">
                            {getProviderIcon(model.provider)}
                            <span className="font-semibold truncate">
                              {model.name}
                            </span>
                          </FieldTitle>
                          {model.description && (
                            <FieldDescription className="text-xs mt-1 line-clamp-1">
                              {model.description}
                            </FieldDescription>
                          )}
                          <ModelCapabilityIcons model={model} />
                        </FieldContent>
                        <RadioGroupItem
                          value={model.id}
                          id={model.id}
                          className="shrink-0"
                        />
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Empty State */}
            {filteredModels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                  <RiSearchLine className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold mb-1">No models found</p>
                <p className="text-xs text-muted-foreground">
                  Try searching for capabilities like "reasoning" or "fast"
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {selectedModel && (
          <div className="p-3 border-t bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-muted-foreground shrink-0">
                {getProviderIcon(selectedModel.provider)}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Currently using
                </span>
                <span className="text-xs font-semibold text-foreground truncate">
                  {selectedModel.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <RiBrainLine className="size-3 text-purple-500" />
                Reasoning
              </span>
              <span className="flex items-center gap-1">
                <RiToolsLine className="size-3 text-blue-500" />
                Tools
              </span>
              <span className="flex items-center gap-1">
                <RiCodeLine className="size-3 text-green-500" />
                Coding
              </span>
              <span className="flex items-center gap-1">
                <RiFlashlightLine className="size-3 text-amber-500" />
                Speed
              </span>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

