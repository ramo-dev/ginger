import { useEffect } from 'react'
import { useMCPStore } from '@/lib/store/mcp-store'
import { useModelStore } from '@/lib/store/model-store'

export function StoreInitializer() {
  const { loadFromServer: loadModelFromServer } = useModelStore()
  const { loadFromServer: loadMCPFromServer } = useMCPStore()

  useEffect(() => {
    // Load preferences from server on mount
    loadModelFromServer()
    loadMCPFromServer()
  }, [loadModelFromServer, loadMCPFromServer])

  // This component doesn't render anything
  return null
}
