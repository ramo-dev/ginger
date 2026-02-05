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

  // Actions
  setSelectedModel: (modelId: string, provider: ModelProvider) => void
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
      selectedModelId: 'gpt-4o',
      selectedProvider: 'openai', // Default to openai or whatever is configured in backend defaults
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModels: [],
      isOllamaEnabled: false,

      setSelectedModel: (modelId, provider) => {
        set({ selectedModelId: modelId, selectedProvider: provider })
        // Auto-sync to server
        get().syncToServer()
      },

      setOllamaBaseUrl: (url) => {
        set({ ollamaBaseUrl: url })
        // Auto-sync to server
        get().syncToServer()
      },

      setOllamaModels: (models) => {
        set({ ollamaModels: models })
        // Auto-sync to server
        get().syncToServer()
      },

      setOllamaEnabled: (enabled) => {
        set({ isOllamaEnabled: enabled })
        // Auto-sync to server
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
