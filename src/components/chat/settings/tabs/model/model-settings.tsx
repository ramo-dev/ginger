import {
  RiHardDrive2Line,
  RiSearchLine,
  RiSignalTowerLine,
} from '@remixicon/react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useModelStore } from '@/lib/store/model-store'

interface ModelSettingsProps {
  setActiveTab: (tab: string) => void
}

export function ModelSettings({ setActiveTab }: ModelSettingsProps) {
  const { isOllamaEnabled, ollamaModels } = useModelStore()
  const [filter, setFilter] = useState('')

  const filteredModels = ollamaModels.filter(
    (m) =>
      m.name.toLowerCase().includes(filter.toLowerCase()) ||
      m.id.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-medium">Available Models</h3>
        <p className="text-sm text-muted-foreground">
          Browse and manage available local models.
        </p>
      </div>

      {!isOllamaEnabled ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl">
          <RiSignalTowerLine className="size-8 text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm font-medium">Ollama is disabled</p>
          <p className="text-xs text-muted-foreground mt-1">
            Enable it in the Connections tab to view models.
          </p>
          <Button
            variant="link"
            className="mt-2 h-auto p-0 text-xs"
            onClick={() => setActiveTab('connections')}
          >
            Go to Connections
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter models..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <div className="flex-1 overflow-hidden rounded-md border">
            <ScrollArea className="h-[250px] sm:h-full">
              <div className="p-0">
                {filteredModels.length > 0 ? (
                  <div className="divide-y">
                    {filteredModels.map((model) => (
                      <div
                        key={model.id}
                        className="p-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{model.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4 px-1 rounded-sm text-muted-foreground"
                            >
                              {model.id}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {model.description}
                            </span>
                          </div>
                        </div>
                        <RiHardDrive2Line className="size-4 text-muted-foreground/30" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <RiSearchLine className="size-8 mb-2 opacity-20" />
                    <p className="text-xs">No matching models found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}
