/**
 * MCP Server Functions
 * Server-side functions for interacting with Docker MCP catalog and managing MCP installations
 */

import { createServerFn } from '@tanstack/react-start'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Docker MCP Catalog Item structure
 * Represents an MCP server available in the Docker catalog
 */
export type MCPCatalogItem = {
  /** MCP server name */
  name : string
  /** Detailed description of MCP functionality */
  description: string
  /** Display title for the MCP */
  title: string
  /** Type of server (always 'server' for MCPs) */
  type: string
  /** When this MCP was added to the catalog */
  dateAdded: string
  /** Docker image reference */
  image: string
  /** Git reference or tag */
  ref: string
  /** URL to README documentation */
  readme: string
  /** URL to tools specification */
  toolsUrl: string
  /** Source code repository URL */
  source: string
  /** Upstream project URL */
  upstream: string
  /** Icon URL for the MCP */
  icon: string
  /** List of available tools */
  tools: Array<{ name: string }>
  /** Required secrets/configuration */
  secrets?: Array<{
    name: string
    env: string
    example: string
    description: string
  }>
  /** Environment variables */
  env?: Array<{
    name: string
    value: string
  }>
  /** Number of available prompts */
  prompts: number
  /** Available resources */
  resources: Record<string, any>
  /** Metadata about the MCP */
  metadata: {
    pulls: number
    stars: number
    githubStars: number
    category: string
    tags: string[]
    license: string
    owner: string
  }
}

/**
 * Installed MCP Server structure
 * Represents an MCP server that's installed on the local system
 */
export type InstalledMCP = {
  /** Server name identifier */
  name: string
  /** Description of the MCP server */
  description: string
  /** Required secrets (none, apikey, etc.) */
  secrets: string
  /** Configuration requirements (none, required, optional) */
  config: string
  /** OAuth requirements (none, required) */
  oauth: string
}

/**
 * Structured MCP Error information
 * Provides detailed error context and helpful guidance
 */
export type MCPError = {
  /** Error type for categorization */
  type: 'docker_not_running' | 'docker_not_installed' | 'network_error' | 'unknown'
  /** Main error message */
  message: string
  /** Standard error output from command */
  stderr?: string
  /** User-friendly explanation and guidance */
  helpfulMessage: string
  /** Link to relevant documentation */
  documentationUrl?: string
}

/**
 * Creates a structured MCP error from a raw error object
 * Analyzes error patterns to provide helpful guidance
 */
function createMCPError(error: any): MCPError {
  const stderr = error.stderr || ''
  
  if (stderr.includes('Docker Desktop is not running') || stderr.includes('docker daemon is not running')) {
    return {
      type: 'docker_not_running',
      message: 'Docker Desktop is not running',
      stderr,
      helpfulMessage: 'Please start Docker Desktop to access the MCP catalog and manage MCP servers.',
      documentationUrl: 'https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/'
    }
  }
  
  if (stderr.includes('docker: command not found') || stderr.includes('docker is not recognized')) {
    return {
      type: 'docker_not_installed',
      message: 'Docker is not installed',
      stderr,
      helpfulMessage: 'Please install Docker Desktop to access the MCP catalog and manage MCP servers.',
      documentationUrl: 'https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/'
    }
  }
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return {
      type: 'network_error',
      message: 'Network connection failed',
      stderr,
      helpfulMessage: 'Please check your internet connection and try again.',
      documentationUrl: 'https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/'
    }
  }
  
  return {
    type: 'unknown',
    message: error.message || 'An unknown error occurred',
    stderr,
    helpfulMessage: 'Please check the console for more details and try again.',
    documentationUrl: 'https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/'
  }
}

/**
 * Fetches the Docker MCP catalog
 * Retrieves all available MCP servers from the Docker catalog registry
 * 
 * @returns Array of MCP catalog items or throws structured error
 * @throws MCPError When Docker is not running, not installed, or other issues occur
 */
export const fetchDockerMCPCatalog = createServerFn().handler(async () => {
  try {
    const { stdout } = await execAsync('docker mcp catalog show --format=json')
    console.log('Docker MCP Catalog:', stdout)
    const data = JSON.parse(stdout)
    
    // The catalog is now an object with a registry property
    if (data && data.registry) {
      return Object.values(data.registry) as MCPCatalogItem[]
    }
    
    // Fallback for backward compatibility
    return data as MCPCatalogItem[]
  } catch (error) {
    const mcpError = createMCPError(error)
    console.error('Failed to fetch Docker MCP catalog:', mcpError)
    throw mcpError
  }
})

/**
 * Fetches installed MCP servers
 * Retrieves list of MCP servers that are installed on the local system
 * 
 * @returns Array of installed MCP items or throws structured error
 * @throws MCPError When Docker is not running or other issues occur
 */
export const fetchInstalledMCPs = createServerFn().handler(async () => {
  try {
    const { stdout } = await execAsync('docker mcp server list --json')
    console.log('Installed MCPs:', stdout)
    const data = JSON.parse(stdout)
    return data as InstalledMCP[]
  } catch (error) {
    const mcpError = createMCPError(error)
    console.error('Failed to fetch installed MCPs:', mcpError)
    throw mcpError
  }
})

/**
 * Installs an MCP server from the Docker catalog
 * Downloads and configures an MCP server for local use
 * 
 * @returns Installation result with success status and message
 * @throws MCPError When installation fails
 */
export const installMCP = createServerFn()
  .handler(async () => {
    // For now, we'll implement this as a simple version
    // In a real implementation, you'd pass the mcpId through the request body
    return { success: false, message: 'Not implemented yet' }
  })

/**
 * Uninstalls an MCP server
 * Removes an MCP server from the local system
 * 
 * @returns Uninstallation result with success status and message
 * @throws MCPError When uninstallation fails
 */
export const uninstallMCP = createServerFn()
  .handler(async () => {
    // For now, we'll implement this as a simple version
    // In a real implementation, you'd pass the mcpId through the request body
    return { success: false, message: 'Not implemented yet' }
  })
