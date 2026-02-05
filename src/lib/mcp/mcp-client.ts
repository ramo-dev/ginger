import { createMCPClient } from '@ai-sdk/mcp'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { type EnabledMCPs, MCP_REGISTRY, type MCPId } from './mcp-config'

export interface MCPClientInstance {
  tools: any
  client: any
}

/**
 * Creates a single MCP client from config
 */
async function createSingleMCPClient(mcpId: MCPId): Promise<MCPClientInstance> {
  const config = MCP_REGISTRY[mcpId]

  if (!config) {
    throw new Error(`MCP config not found for ID: ${mcpId}`)
  }

  const client = await createMCPClient({
    transport: new StdioClientTransport({
      command: config.docker.command || 'docker',
      args: config.docker.args || ['run', '-i', '--rm', config.docker.image],
    }),
  })

  return {
    tools: await client.tools(),
    client,
  }
}

/**
 * Creates MCP clients for all enabled MCPs
 * Returns a map of MCP ID to client instance
 */
export async function createMCPClients(
  enabledMCPs: EnabledMCPs,
): Promise<Record<string, MCPClientInstance>> {
  const enabledIds = Object.entries(enabledMCPs)
    .filter(([_, enabled]) => enabled === true)
    .map(([id]) => id as MCPId)

  if (enabledIds.length === 0) {
    return {}
  }

  // Create all clients in parallel
  const clientPromises = enabledIds.map(async (id) => {
    const instance = await createSingleMCPClient(id)
    return [id, instance] as const
  })

  const clientEntries = await Promise.all(clientPromises)
  return Object.fromEntries(clientEntries)
}

/**
 * Helper to merge all tools from MCP clients
 */
export function mergeAllTools(mcpClients: Record<string, MCPClientInstance>) {
  let allMCPTools = {}

  for (const instance of Object.values(mcpClients)) {
    allMCPTools = { ...allMCPTools, ...instance.tools }
  }

  return allMCPTools
}

/**
 * Helper to get all clients for cleanup
 */
export function getAllClients(mcpClients: Record<string, MCPClientInstance>) {
  return Object.values(mcpClients).map((instance) => instance.client)
}
