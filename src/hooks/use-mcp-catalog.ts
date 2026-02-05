import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllMCPs, MCPConfig } from '@/lib/mcp/mcp-config'
import { fetchDockerMCPCatalog, MCPCatalogItem } from '@/lib/mcp/mcp.server'

type MCPCatalogStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseMCPCatalogReturn {
  mcpTools: MCPConfig[]
  status: MCPCatalogStatus
  isLoading: boolean
  error: Error | null
  refetch: () => void
  progress: number
}

export function useMCPCatalog(): UseMCPCatalogReturn {
  const hardcodedMCPs = getAllMCPs()

  const {
    data: dockerCatalog,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mcp-catalog'],
    queryFn: async () => {
      const result = await fetchDockerMCPCatalog()
      return result
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a network error or if we've tried twice
      if (failureCount >= 2) return false
      return true
    },
  })

  // Merge Docker catalog with hardcoded MCPs, avoiding redundancy
  const mergedMCPs = React.useMemo(() => {
    // If there's an error or no data, return hardcoded MCPs
    if (error || !dockerCatalog || !Array.isArray(dockerCatalog)) {
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
        // Extract the ID from the title
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
  }, [dockerCatalog, hardcodedMCPs, error])

  // Calculate progress based on loading state
  const progress = React.useMemo(() => {
    if (!isLoading && !isFetching) return 100
    if (isLoading || isFetching) return 50
    return 75
  }, [isLoading, isFetching])

  const status: MCPCatalogStatus = React.useMemo(() => {
    if (isLoading || isFetching) return 'loading'
    if (error) return 'error'
    if (dockerCatalog || hardcodedMCPs.length > 0) return 'success'
    return 'idle'
  }, [isLoading, isFetching, error, dockerCatalog, hardcodedMCPs])

  return {
    mcpTools: mergedMCPs,
    status,
    isLoading: isLoading || isFetching,
    error,
    refetch,
    progress,
  }
}
