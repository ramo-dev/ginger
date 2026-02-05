import { streamText, UIMessage, convertToModelMessages } from 'ai'
import { createFileRoute } from '@tanstack/react-router'
import { EnabledMCPs } from '@/lib/mcp/mcp-config'
import {
  createMCPClients,
  getAllClients,
  mergeAllTools,
} from '@/lib/mcp/mcp-client'
import { ModelProviderFactory } from '@/lib/providers/provider-factory'
import { OpenRouterProviderOptions } from '@openrouter/ai-sdk-provider'
import { tools } from './(chat)/tools/-index'
import { SYS_PROMPT_WITH_CONTEXT } from '@/lib/ai/model'


export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const {
          messages,
          enabledMCPs = {},
          model,
          provider,
          ollamaUrl,
        }: {
          messages: UIMessage[]
          enabledMCPs?: EnabledMCPs
          model?: string
          provider?: string
          ollamaUrl?: string
        } = await request.json()

        let allTools = { ...tools }
        console.log("ALL_TOOLS", allTools);
        let mcpClients: Record<string, any> = {}

        // Check if any MCPs are enabled
        const hasEnabledMCPs = Object.values(enabledMCPs).some(
          (enabled) => enabled === true,
        )

        if (hasEnabledMCPs) {
          // Dynamically create only the enabled MCP clients
          mcpClients = await createMCPClients(enabledMCPs)

          // Merge all MCP tools into the tools object
          const mcpTools = mergeAllTools(mcpClients)
          allTools = { ...allTools, ...mcpTools }
        }

        const languageModel = ModelProviderFactory.createModel({
          provider: provider as any,
          model,
          ollamaBaseUrl: ollamaUrl,
        })

        const result = streamText({
          model: languageModel,
          messages: await convertToModelMessages(messages),
          system: SYS_PROMPT_WITH_CONTEXT({}),
          tools: allTools,
          providerOptions: {
            reasoning: {
              enabled: true,
              effort: 'medium',
            },
          } satisfies OpenRouterProviderOptions,
          onFinish: async () => {
            // Close all MCP clients
            const clients = getAllClients(mcpClients)
            await Promise.all(clients.map((client) => client.close()))
          },
        })

        return result.toUIMessageStreamResponse({
          sendReasoning: true,
          sendSources: true,
        })
      },
    },
  },
})
