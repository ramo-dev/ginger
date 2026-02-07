import { streamText, UIMessage, convertToModelMessages } from 'ai'
import { createFileRoute } from '@tanstack/react-router'
import { EnabledMCPs } from '@/lib/mcp/mcp-config'
import {
  createMCPClients,
  getAllClients,
  mergeAllTools,
} from '@/lib/mcp/mcp-client'
import { duckduckgoMCP } from '@/lib/mcp/mcp-custom'
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
          reasoning,
        }: {
          messages: UIMessage[]
          enabledMCPs?: EnabledMCPs
          model?: string
          provider?: string
          ollamaUrl?: string
          reasoning?: boolean
        } = await request.json()

        console.log('SELECTED_MODEL', model, provider)

        const searchTool = await duckduckgoMCP.tools()
        let allTools = { ...tools, ...searchTool }
        let mcpClients: Record<string, any> = {}

        // Check if any MCPs are enabled
        const hasEnabledMCPs = Object.values(enabledMCPs).some(
          (enabled) => enabled === true,
        )

        if (hasEnabledMCPs) {
          // Dynamically create only the enabled MCP clients
          mcpClients = await createMCPClients(enabledMCPs)

          //Merge all MCP tools into the tools object
          const mcpTools = mergeAllTools(mcpClients)
          allTools = { ...allTools, ...mcpTools }

          console.log('ALL_TOOLS', allTools)
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
              enabled: reasoning,
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
          sendReasoning: reasoning,
          sendSources: true,
        })
      },
    },
  },
})
