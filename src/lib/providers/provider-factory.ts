import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import type { LanguageModel } from 'ai'
import { createOllama } from 'ollama-ai-provider-v2'
import type { ModelProvider } from '@/lib/constants'

export interface ProviderConfig {
  provider: ModelProvider
  model?: string
  ollamaBaseUrl?: string
  apiKey?: string
}

export class ModelProviderFactory {
  private static openRouterInstance = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  static createModel(config: ProviderConfig): LanguageModel {
    switch (config.provider) {
      case 'ollama': {
        let baseURL =
          config.ollamaBaseUrl ||
          process.env.OLLAMA_BASE_URL ||
          'http://localhost:11434'

        if (!baseURL.endsWith('/api')) {
          baseURL = `${baseURL}/api`
        }

        const ollama = createOllama({
          baseURL,
        })

        return ollama(config.model || 'llama2')
      }

      case 'openrouter':
      case 'openai':
      case 'anthropic':
      case 'google':
        return ModelProviderFactory.openRouterInstance.chat(
          config.model || 'tngtech/tng-r1t-chimera:free',
        )

      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  static getOpenRouterProvider() {
    return ModelProviderFactory.openRouterInstance
  }
}
