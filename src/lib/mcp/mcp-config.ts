/**
 * Centralized MCP Configuration
 * Add new MCP tools here and they'll automatically be available in both UI and server
 */

export interface MCPConfig {
  id: string
  name: string
  description: string
  category: string
  docker: {
    image: string
    command?: string
    args?: string[]
  }
}

/**
 * Define all available MCP tools here
 * This is the single source of truth for MCP configuration
 */
export const MCP_REGISTRY: Record<string, MCPConfig> = {
  playwrights: {
    id: 'playwrights',
    name: 'Playwright',
    description: 'Web automation and scraping',
    category: 'Browser',
    docker: {
      image: 'mcp/playwright',
    },
  },
  duckduckgo: {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    description: 'Live web search capabilities',
    category: 'Search',
    docker: {
      image: 'mcp/duckduckgo',
    },
  },
  node_sandbox: {
    id: 'node_sandbox',
    name: 'Node Sandbox',
    description: 'Execute Node.js code in a sandboxed environment',
    category: 'Code Execution',
    docker: {
      image: 'mcp/node-code-sandbox',
    },
  },
  file_system: {
    id: 'file_system',
    name: 'Desktop Commander',
    description: 'File system operations and management',
    category: 'System',
    docker: {
      image: 'mcp/desktop-commander',
    },
  },
  memory: {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent memory and context storage',
    category: 'Storage',
    docker: {
      image: 'mcp/memory',
    },
  },
  py_sandbox: {
    id: 'py_sandbox',
    name: 'Python Interpreter',
    description: 'Execute Python code in a sandboxed environment',
    category: 'Code Execution',
    docker: {
      image: 'mcp/mcp-code-interpreter',
    },
  },
} as const

/**
 * Type-safe MCP IDs extracted from registry
 */
export type MCPId = keyof typeof MCP_REGISTRY

/**
 * Type for enabled MCPs object
 */
export type EnabledMCPs = Partial<Record<MCPId, boolean>>

/**
 * Get all MCP configs as an array
 */
export function getAllMCPs(): MCPConfig[] {
  return Object.values(MCP_REGISTRY)
}

/**
 * Get MCP config by ID
 */
export function getMCPById(id: MCPId): MCPConfig | undefined {
  return MCP_REGISTRY[id]
}

/**
 * Get enabled MCP configs from enabledMCPs object
 */
export function getEnabledMCPConfigs(enabledMCPs: EnabledMCPs): MCPConfig[] {
  return Object.entries(enabledMCPs)
    .filter(([_, enabled]) => enabled === true)
    .map(([id]) => MCP_REGISTRY[id as MCPId])
    .filter((config): config is MCPConfig => config !== undefined)
}
