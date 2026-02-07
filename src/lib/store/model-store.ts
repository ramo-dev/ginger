import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Model, ModelProvider } from '@/lib/constants'
import { OPENROUTER_MODELS } from '@/lib/constants'

interface ModelState {
  selectedModelId: string
  selectedProvider: ModelProvider
  ollamaBaseUrl: string
  ollamaModels: Model[]
  isOllamaEnabled: boolean
  reasoning: boolean

  // Actions
  setSelectedModel: (modelId: string, provider: ModelProvider) => void
  setReasoning: (val: boolean) => void
  setOllamaBaseUrl: (url: string) => void
  setOllamaModels: (models: Model[]) => void
  setOllamaEnabled: (enabled: boolean) => void
  getAllModels: () => Model[]
  syncToServer: () => Promise<void>
  loadFromServer: () => Promise<void>
}

export const useModelStore = create<ModelState>()(
  persist(
    (set, get) => ({
      selectedModelId: 'z-ai/glm-4.5-air:free',
      selectedProvider: 'openrouter',
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModels: [],
      isOllamaEnabled: false,
      reasoning: true,

      setReasoning: (val) => {
        set({ reasoning: val })
        // Auto-sync to server
        get().syncToServer()
      },
      setSelectedModel: (modelId, provider) => {
        set({ selectedModelId: modelId, selectedProvider: provider })
        get().syncToServer()
      },

      setOllamaBaseUrl: (url) => {
        set({ ollamaBaseUrl: url })
        get().syncToServer()
      },

      setOllamaModels: (models) => {
        set({ ollamaModels: models })
        get().syncToServer()
      },

      setOllamaEnabled: (enabled) => {
        set({ isOllamaEnabled: enabled })
        get().syncToServer()
      },

      getAllModels: () => {
        const state = get()
        const models = [...OPENROUTER_MODELS]
        if (state.isOllamaEnabled) {
          models.push(...state.ollamaModels)
        }
        return models
      },

      syncToServer: async () => {
        try {
          const state = get()
          await fetch('/api/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: {
                selectedModelId: state.selectedModelId,
                selectedProvider: state.selectedProvider,
                ollamaBaseUrl: state.ollamaBaseUrl,
                ollamaModels: state.ollamaModels,
                isOllamaEnabled: state.isOllamaEnabled,
              },
            }),
          })
        } catch (error) {
          console.error('Failed to sync model preferences:', error)
        }
      },

      loadFromServer: async () => {
        try {
          const response = await fetch('/api/preferences')
          if (response.ok) {
            const preferences = await response.json()
            if (preferences.model) {
              set({
                selectedModelId: preferences.model.selectedModelId || 'gpt-4o',
                selectedProvider:
                  preferences.model.selectedProvider || 'openai',
                ollamaBaseUrl:
                  preferences.model.ollamaBaseUrl || 'http://localhost:11434',
                ollamaModels: preferences.model.ollamaModels || [],
                isOllamaEnabled: preferences.model.isOllamaEnabled || false,
              })
            }
          }
        } catch (error) {
          console.error('Failed to load model preferences:', error)
        }
      },
    }),
    {
      name: 'model-storage',
    },
  ),
)
