import {
  RiBarChartLine,
  RiFundsLine,
  RiInboxArchiveLine,
  RiMegaphoneLine,
} from '@remixicon/react'

export type ModelProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'ollama'
  | 'openrouter'

export interface Model {
  id: string
  name: string
  provider: ModelProvider
  description?: string
  contextWindow?: number
  details?: Record<string, unknown>
}

export interface OllamaModelResponse {
  models: {
    name: string
    model: string
    modified_at: string
    size: number
    digest: string
    details: {
      parent_model: string
      format: string
      family: string
      families: string[]
      parameter_size: string
      quantization_level: string
    }
  }[]
}

export const OPENROUTER_MODELS: Model[] = [
  {
    id: 'tngtech/deepseek-r1t2-chimera:free',
    name: 'Deepseek Chimera R1T2',
    provider: 'openrouter',
  },
  {
    id: 'arcee-ai/trinity-large-preview:free',
    name: 'Trinity Large',
    provider: 'openrouter',
  },
  {
    id: 'tngtech/tng-r1t-chimera:free',
    name: 'TNG R1T Chimera',
    provider: 'openrouter',
  },
  {
    id: 'qwen/qwen3-next-80b-a3b-instruct:free',
    name: 'Qwen3 80b',
    provider: 'openrouter',
  },
  {
    id: 'openai/gpt-oss-120b:free',
    name: 'GPT OSS 120b OR',
    provider: 'openrouter',
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20b OR',
    provider: 'openrouter',
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 air',
    provider: 'openrouter',
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Venice',
    provider: 'openrouter',
  },
]

//Suggestion constants

export const SUGGESTIONS = [
  {
    title: 'Productivity Boost',
    label: 'How can I be more productive?',
    prompt: 'Suggest ways to improve my daily workflow and time management.',
    icon: RiBarChartLine,
  },
  {
    title: 'Growth Strategies',
    label: 'How can I grow my business?',
    prompt: 'Recommend strategies for scaling and improving operations.',
    icon: RiFundsLine,
  },
  {
    title: 'Resource Allocation',
    label: 'How can I optimize my resources?',
    prompt:
      'Provide advice on managing teams, budgets, or projects more efficiently.',
    icon: RiInboxArchiveLine,
  },
  {
    title: 'Marketing Ideas',
    label: 'How can I improve my marketing efforts?',
    prompt:
      'Suggest creative campaigns to attract more attention to my brand or service.',
    icon: RiMegaphoneLine,
  },
] as const
