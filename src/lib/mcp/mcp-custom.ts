import { createMCPClient } from '@ai-sdk/mcp'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

export const duckduckgoMCP = await createMCPClient({
  transport: new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'src/server/duckduckgo-server.ts'],
  }),
})
