import { createMCPClient } from '@ai-sdk/mcp'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

// Initialize DuckDuckGo MCP client
const duckduckgoClient = await createMCPClient({
  transport: new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'src/server/mcp/duckduckgo.ts'],
  }),
})

// Get tools from all MCP servers
const duckduckgoTools = await duckduckgoClient.tools()

// Export combined tools object for AI SDK
export const mcpTools = {
  ...duckduckgoTools,
  // Add more MCP server tools here as needed
  // ...weatherTools,
  // ...filesystemTools,
}

// Cleanup function (call on app shutdown)
export async function closeMCPClients() {
  await duckduckgoClient.close()
}
