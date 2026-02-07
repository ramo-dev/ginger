import { RiCheckLine, RiLoader4Line, RiRefreshLine } from '@remixicon/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useModelStore } from '@/lib/store/model-store'
import type { OllamaModelResponse } from '@/lib/constants'

export function ProviderSettings() {
  const {
    ollamaBaseUrl,
    setOllamaBaseUrl,
    isOllamaEnabled,
    setOllamaEnabled,
    setOllamaModels,
    ollamaModels,
  } = useModelStore()

  const [loading, setLoading] = useState(false)

  const fetchModels = async () => {
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const cleanUrl = ollamaBaseUrl.replace(/\/$/, '')
      const response = await fetch(`${cleanUrl}/api/tags`, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.statusText}`)
      }

      const data: OllamaModelResponse = await response.json()

      const models = data.models.map((m) => ({
        id: m.model,
        name: m.name,
        provider: 'ollama' as const,
        description: `${(m.size / 1024 / 1024 / 1024).toFixed(1)}GB - ${m.details.parameter_size} params`,
        details: m.details as Record<string, unknown>,
      }))

      setOllamaModels(models as any)
      toast.success(`Successfully connected! Found ${models.length} models.`)
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to connect to Ollama',
      )
      setOllamaModels([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-lg font-medium">Provider Connections</h3>
        <p className="text-sm text-muted-foreground">
          Manage your LLM provider connections.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Ollama</Label>
            <p className="text-xs text-muted-foreground">Local LLM runner</p>
          </div>
          <Switch
            checked={isOllamaEnabled}
            onCheckedChange={setOllamaEnabled}
          />
        </div>

        {isOllamaEnabled && (
          <div className="pt-2 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-muted-foreground">
                Base URL
              </Label>
              <div className="flex gap-2">
                <Input
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="h-9 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchModels}
                  disabled={loading}
                  className="h-9 gap-2 min-w-[80px]"
                >
                  {loading ? (
                    <RiLoader4Line className="size-3.5 animate-spin" />
                  ) : (
                    <RiRefreshLine className="size-3.5" />
                  )}
                  Check
                </Button>
              </div>
            </div>

            {ollamaModels.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-md w-fit">
                <RiCheckLine className="size-3.5" />
                <span>Connected: {ollamaModels.length} models available</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
