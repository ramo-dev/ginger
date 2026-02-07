import {
  RiCodeLine,
  RiSparklingLine,
  RiRocketLine,
  RiLightbulbLine,
  RiBrainLine,
  RiToolsLine,
  RiChatSmile3Line,
  RiMovie2Line,
  RiEyeLine,
  RiMenuSearchLine,
} from '@remixicon/react'

export type ModelProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'ollama'
  | 'openrouter'

export interface ModelCapabilities {
  reasoning: boolean
  toolCall: boolean
  speed: 'fast' | 'medium' | 'slow'
  vision?: boolean
  coding?: boolean
}

export interface Model {
  id: string
  name: string
  provider: ModelProvider
  description?: string
  contextWindow?: number
  capabilities: ModelCapabilities
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
    description: 'Advanced reasoning model with hybrid capabilities',
    capabilities: {
      reasoning: true,
      toolCall: true,
      speed: 'medium',
      coding: true,
    },
  },
  {
    id: 'arcee-ai/trinity-large-preview:free',
    name: 'Trinity Large',
    provider: 'openrouter',
    description: 'Large-scale model with balanced performance',
    capabilities: {
      reasoning: true,
      toolCall: true,
      speed: 'medium',
      coding: true,
    },
  },
  {
    id: 'tngtech/tng-r1t-chimera:free',
    name: 'TNG R1T Chimera',
    provider: 'openrouter',
    description: 'Reasoning-focused chimera architecture',
    capabilities: {
      reasoning: true,
      toolCall: true,
      speed: 'medium',
      coding: true,
    },
  },
  {
    id: 'qwen/qwen3-next-80b-a3b-instruct:free',
    name: 'Qwen3 80b',
    provider: 'openrouter',
    description: 'High-performance 80B parameter model',
    capabilities: {
      reasoning: true,
      toolCall: true,
      speed: 'slow',
      coding: true,
      vision: false,
    },
  },
  {
    id: 'openai/gpt-oss-120b:free',
    name: 'GPT OSS 120b',
    provider: 'openrouter',
    description: 'Open-source GPT variant - 120B params',
    capabilities: {
      reasoning: false,
      toolCall: true,
      speed: 'slow',
      coding: true,
    },
  },
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT OSS 20b',
    provider: 'openrouter',
    description: 'Lightweight open-source GPT variant',
    capabilities: {
      reasoning: false,
      toolCall: true,
      speed: 'fast',
      coding: true,
    },
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    provider: 'openrouter',
    description: 'Efficient and responsive general model',
    capabilities: {
      reasoning: false,
      toolCall: true,
      speed: 'fast',
      coding: false,
    },
  },
  {
    id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
    name: 'Venice',
    provider: 'openrouter',
    description: 'Uncensored conversational model',
    capabilities: {
      reasoning: false,
      toolCall: false,
      speed: 'fast',
      coding: true,
    },
  },
]

// Fresh, engaging suggestions for 2025
export const SUGGESTIONS = [
  {
    title: 'Deep Research',
    label: 'Research on Ai and Climate',
    prompt:
      'can you perform a deep research on environmental impact of data centres, energy sources these data centres use as well as timelines of how and when the data centres are projected to shift to 100% renewable sources of energy, use the Search tool to look up relevant data.',
    icon: RiMenuSearchLine,
  },
  {
    title: 'Creative Spark',
    label: 'Generate unique app ideas',
    prompt:
      'Brainstorm 5 innovative app concepts that solve real problems in unexpected ways.',
    icon: RiSparklingLine,
  },
  {
    title: 'Launch Strategy',
    label: 'Plan my product launch',
    prompt:
      'Create a comprehensive go-to-market strategy for launching a new product, including timeline and key milestones.',
    icon: RiRocketLine,
  },
  {
    title: 'Problem Solver',
    label: 'Debug this tricky issue',
    prompt:
      'Help me troubleshoot and fix this technical problem with detailed step-by-step analysis.',
    icon: RiLightbulbLine,
  },
  {
    title: 'Chat Companion',
    label: 'Be my rubber duck',
    prompt:
      "Let's discuss and refine my ideas through conversation - help me think through the edge cases.",
    icon: RiChatSmile3Line,
  },
  {
    title: 'Story Builder',
    label: 'Write an interactive story',
    prompt:
      'Craft an engaging narrative with branching paths and meaningful choices.',
    icon: RiMovie2Line,
  },
] as const

export const CAPABILITY_CONFIG = {
  reasoning: {
    label: 'Reasoning',
    icon: RiBrainLine,
    color: 'text-purple-500 bg-purple-500/10',
  },
  toolCall: {
    label: 'Tool Calling',
    icon: RiToolsLine,
    color: 'text-blue-500 bg-blue-500/10',
  },
  coding: {
    label: 'Coding',
    icon: RiCodeLine,
    color: 'text-green-500 bg-green-500/10',
  },
  vision: {
    label: 'Vision',
    icon: RiEyeLine,
    color: 'text-orange-500 bg-orange-500/10',
  },
} as const
