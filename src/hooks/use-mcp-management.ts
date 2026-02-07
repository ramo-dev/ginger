import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllMCPs, MCPConfig } from '@/lib/mcp/mcp-config'
import {
  fetchDockerMCPCatalog,
  fetchInstalledMCPs,
  installMCP,
  uninstallMCP,
  MCPCatalogItem,
  InstalledMCP,
  MCPError
} from '@/lib/mcp/mcp.server'
import { useMCPStore } from '@/lib/store/mcp-store'

type MCPCatalogStatus = 'idle' | 'loading' | 'success' | 'error'

interface MCPManagementReturn {
  // Available MCPs (from catalog + hardcoded)
  availableMCPs: MCPConfig[]
  // Installed MCPs (from system)
  installedMCPs: InstalledMCP[]
  // Combined list with installation status
  mcpTools: (MCPConfig & {
    isInstalled: boolean
    installStatus?: 'installed' | undefined
    version?: string | undefined
  })[]

  // Loading states
  isLoading: boolean
  isInstalling: boolean
  isUninstalling: boolean

  // Status
  status: MCPCatalogStatus
  error: MCPError | null

  // Actions
  installMCP: (mcpId: string) => Promise<{ success: boolean; message: string }>
  uninstallMCP: (mcpId: string) => Promise<{ success: boolean; message: string }>
  refetch: () => void
  refreshInstalled: () => void
}

export function useMCPManagement(): MCPManagementReturn {
  const queryClient = useQueryClient()
  const hardcodedMCPs = getAllMCPs()
  const { enabledMCPs, enableMCP } = useMCPStore()

  // Fetch Docker catalog
  const {
    data: dockerCatalog,
    isLoading: isLoadingCatalog,
    error: catalogError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ['mcp-catalog'],
    queryFn: async () => {
      const result = await fetchDockerMCPCatalog()
      return result
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - increased from 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour - keep in cache longer
    retry: (failureCount, error) => {
      // Don't retry on Docker connection errors
      if (error && typeof error === 'object' && 'type' in error) {
        const mcpError = error as unknown as MCPError
        if (mcpError.type === 'docker_not_running' || mcpError.type === 'docker_not_installed') {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  // Fetch installed MCPs
  const {
    data: installedMCPs = [],
    isLoading: isLoadingInstalled,
    error: installedError,
    refetch: refetchInstalled,
  } = useQuery({
    queryKey: ['installed-mcps'],
    queryFn: async () => {
      const result = await fetchInstalledMCPs()
      return result
    },
    staleTime: 1000 * 60 * 15, // 15 minutes - increased from 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on Docker connection errors
      if (error && typeof error === 'object' && 'type' in error) {
        const mcpError = error as unknown as MCPError
        if (mcpError.type === 'docker_not_running' || mcpError.type === 'docker_not_installed') {
          return false
        }
      }
      return failureCount < 1
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Exponential backoff
  })

  // Auto-enable installed MCPs that match hardcoded MCPs
  React.useEffect(() => {
    if (installedMCPs.length > 0) {
      installedMCPs.forEach(installedMcp => {
        // Find matching hardcoded MCP
        const matchingHardcoded = hardcodedMCPs.find(hardcoded => {
          return hardcoded.id === installedMcp.name ||
            hardcoded.name.toLowerCase() === installedMcp.name.toLowerCase()
        })

        if (matchingHardcoded && !enabledMCPs[matchingHardcoded.id]) {
          enableMCP(matchingHardcoded.id)
        }
      })
    }
  }, [installedMCPs, hardcodedMCPs, enabledMCPs, enableMCP])

  // Install MCP mutation
  const installMutation = useMutation({
    mutationFn: async (mcpId: string) => {
      // Get the MCP config to find the actual name for Docker
      const config = hardcodedMCPs.find(m => m.id === mcpId)
      const mcpName = config?.id || mcpId

      // Call the server function with the MCP name
      const result = await installMCP({ data: mcpName })
      return result
    },
    onSuccess: () => {
      // Refresh installed MCPs after successful installation
      queryClient.invalidateQueries({ queryKey: ['installed-mcps'] })
    },
  })

  // Uninstall MCP mutation
  const uninstallMutation = useMutation({
    mutationFn: async (mcpId: string) => {
      // Get the MCP config to find the actual name for Docker
      const config = hardcodedMCPs.find(m => m.id === mcpId)
      const mcpName = config?.id || mcpId

      // Call the server function with the MCP name
      const result = await uninstallMCP({ data: mcpName })
      return result
    },
    onSuccess: () => {
      // Refresh installed MCPs after successful uninstallation
      queryClient.invalidateQueries({ queryKey: ['installed-mcps'] })
    },
  })

  // Merge Docker catalog with hardcoded MCPs, avoiding redundancy
  const availableMCPs = React.useMemo(() => {
    if (!dockerCatalog || !Array.isArray(dockerCatalog)) {
      return hardcodedMCPs
    }

    // Create a map of hardcoded MCPs by ID for quick lookup
    const hardcodedMap = new Map(hardcodedMCPs.map(mcp => [mcp.id, mcp]))

    // Convert Docker catalog items to MCPConfig format
    const dockerMCPs: MCPConfig[] = dockerCatalog
      .filter((item): item is MCPCatalogItem =>
        item &&
        typeof item === 'object' &&
        'title' in item &&
        'description' in item &&
        'metadata' in item &&
        'category' in item.metadata
      )
      .map(item => {
        // Extract the ID from the registry key (we'll need to update this)
        const id = item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
        return {
          id,
          name: item.title,
          description: item.description,
          category: item.metadata.category,
          docker: {
            image: item.image,
          },
        }
      })
      .filter(item => !hardcodedMap.has(item.id))

    // Combine hardcoded and Docker MCPs
    return [...hardcodedMCPs, ...dockerMCPs]
  }, [dockerCatalog, hardcodedMCPs])

  // Create installed MCPs map for quick lookup with multiple matching strategies
  const installedMCPsMap = React.useMemo(() => {
    const map = new Map<string, InstalledMCP>()
    installedMCPs.forEach(mcp => {
      // Add multiple keys for matching
      map.set(mcp.name.toLowerCase(), mcp) // exact name
      map.set(mcp.name, mcp) // original case

      // Try to match common variations
      if (mcp.name === 'playwright') {
        map.set('playwrights', mcp) // hardcoded ID
        map.set('Playwright', mcp) // hardcoded name
      }
      if (mcp.name === 'duckduckgo') {
        map.set('DuckDuckGo', mcp) // hardcoded name
      }
      if (mcp.name === 'node-code-sandbox') {
        map.set('node_sandbox', mcp) // hardcoded ID
        map.set('Node Sandbox', mcp) // hardcoded name
      }
      if (mcp.name === 'desktop-commander') {
        map.set('file_system', mcp) // hardcoded ID
        map.set('Desktop Commander', mcp) // hardcoded name
      }
      if (mcp.name === 'memory') {
        map.set('Memory', mcp) // hardcoded name
      }
      if (mcp.name === 'mcp-code-interpreter') {
        map.set('py_sandbox', mcp) // hardcoded ID
        map.set('Python Interpreter', mcp) // hardcoded name
      }
    })
    return map
  }, [installedMCPs])

  // Combine available MCPs with installation status
  const mcpTools = React.useMemo(() => {
    return availableMCPs.map(mcp => {
      // Try multiple matching strategies
      const installedByName = installedMCPsMap.get(mcp.name)
      const installedById = installedMCPsMap.get(mcp.id)
      const installed = installedByName || installedById

      return {
        ...mcp,
        isInstalled: !!installed,
        installStatus: installed ? 'installed' as const : undefined,
        version: undefined,
      }
    })
  }, [availableMCPs, installedMCPsMap])

  // Calculate overall loading state
  const isLoading = isLoadingCatalog || isLoadingInstalled
  const isInstalling = installMutation.isPending
  const isUninstalling = uninstallMutation.isPending

  // Calculate overall status
  const status = React.useMemo(() => {
    if (isLoadingCatalog || isLoadingInstalled) return 'loading'
    if (catalogError || installedError) return 'error'
    if (dockerCatalog || hardcodedMCPs.length > 0) return 'success'
    return 'idle'
  }, [isLoadingCatalog, isLoadingInstalled, catalogError, installedError, dockerCatalog, hardcodedMCPs])

  // Combine errors, prioritizing Docker errors
  const error = React.useMemo(() => {
    if (catalogError && 'type' in catalogError && 'helpfulMessage' in catalogError) {
      return catalogError as MCPError
    }
    if (installedError && 'type' in installedError && 'helpfulMessage' in installedError) {
      return installedError as MCPError
    }
    if (catalogError) {
      return {
        type: 'unknown' as const,
        message: catalogError.message,
        helpfulMessage: 'Failed to load MCP catalog. Please try again.',
        documentationUrl: 'https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/'
      } as MCPError
    }
    if (installedError) {
      return {
        type: 'unknown' as const,
        message: installedError.message,
        helpfulMessage: 'Failed to load installed MCPs. Please try again.',
        documentationUrl: 'https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/'
      } as MCPError
    }
    return null
  }, [catalogError, installedError])

  return {
    availableMCPs,
    installedMCPs,
    mcpTools,
    isLoading,
    isInstalling,
    isUninstalling,
    status,
    error,
    installMCP: installMutation.mutateAsync,
    uninstallMCP: uninstallMutation.mutateAsync,
    refetch: () => {
      refetchCatalog()
      refetchInstalled()
    },
    refreshInstalled: refetchInstalled,
  }
}
