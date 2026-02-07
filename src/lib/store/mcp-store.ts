import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnabledMCPs, MCPId } from '@/lib/mcp/mcp-config'
import { mcpManager } from '@/lib/mcp/mcp-manager'

interface MCPStore {
  // Enabled MCPs (active in chat)
  enabledMCPs: EnabledMCPs

  // Added MCPs (user's selected collection from catalog)
  addedMCPs: MCPId[]

  // Enable/Disable actions
  toggleMCP: (id: MCPId) => void
  enableMCP: (id: MCPId) => void
  disableMCP: (id: MCPId) => void
  setEnabledMCPs: (mcps: EnabledMCPs) => void
  resetMCPs: () => void

  // Add/Remove actions
  addMCP: (id: MCPId) => void
  removeMCP: (id: MCPId) => void
  setAddedMCPs: (mcps: MCPId[]) => void
  isAdded: (id: MCPId) => boolean

  // Sync actions
  syncToServer: () => Promise<void>
  loadFromServer: () => Promise<void>

  // Manager sync
  syncWithManager: () => void
}

export const useMCPStore = create<MCPStore>()(
  persist(
    (set, get) => ({
      enabledMCPs: {},
      addedMCPs: [],

      // Enable/Disable actions
      toggleMCP: (id) => {
        set((state) => ({
          enabledMCPs: {
            ...state.enabledMCPs,
            [id]: !state.enabledMCPs[id],
          },
        }))
        // Auto-sync to server and manager
        get().syncToServer()
        get().syncWithManager()
      },

      enableMCP: (id) => {
        set((state) => ({
          enabledMCPs: {
            ...state.enabledMCPs,
            [id]: true,
          },
        }))
        // Auto-sync to server and manager
        get().syncToServer()
        get().syncWithManager()
      },

      disableMCP: (id) => {
        set((state) => ({
          enabledMCPs: {
            ...state.enabledMCPs,
            [id]: false,
          },
        }))
        // Auto-sync to server and manager
        get().syncToServer()
        get().syncWithManager()
      },

      setEnabledMCPs: (mcps) => {
        set({ enabledMCPs: mcps })
        // Auto-sync to server and manager
        get().syncToServer()
        get().syncWithManager()
      },

      resetMCPs: () => {
        set({ enabledMCPs: {} })
        // Auto-sync to server and manager
        get().syncToServer()
        get().syncWithManager()
      },

      // Add/Remove actions
      addMCP: (id) => {
        const result = mcpManager.addMCP(id)
        if (result.success) {
          set((state) => ({
            addedMCPs: [...state.addedMCPs, id],
          }))
          // Auto-sync to server
          get().syncToServer()
        }
      },

      removeMCP: (id) => {
        const result = mcpManager.removeMCP(id)
        if (result.success) {
          set((state) => ({
            addedMCPs: state.addedMCPs.filter((mcpId) => mcpId !== id),
            // Also remove from enabled if it was enabled
            enabledMCPs: {
              ...state.enabledMCPs,
              [id]: false,
            },
          }))
          // Auto-sync to server
          get().syncToServer()
        }
      },

      setAddedMCPs: (mcps) => {
        set({ addedMCPs: mcps })
        // Sync to manager
        mcpManager.initialize({
          addedMCPs: mcps,
          enabledMCPs: get().enabledMCPs,
        })
        // Auto-sync to server
        get().syncToServer()
      },

      isAdded: (id) => {
        return get().addedMCPs.includes(id)
      },

      // Sync with manager
      syncWithManager: () => {
        const state = get()
        mcpManager.setEnabledMCPs(state.enabledMCPs)
      },

      syncToServer: async () => {
        try {
          const state = get()
          await fetch('/api/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mcp: {
                enabledMCPs: state.enabledMCPs,
                addedMCPs: state.addedMCPs,
              },
            }),
          })
        } catch (error) {
          console.error('Failed to sync MCP preferences:', error)
        }
      },

      loadFromServer: async () => {
        try {
          const response = await fetch('/api/preferences')
          if (response.ok) {
            const preferences = await response.json()
            if (preferences.mcp) {
              set({
                enabledMCPs: preferences.mcp.enabledMCPs || {},
                addedMCPs: preferences.mcp.addedMCPs || [],
              })
              // Sync to manager
              get().syncWithManager()
            }
          }
        } catch (error) {
          console.error('Failed to load MCP preferences:', error)
        }
      },
    }),
    {
      name: 'mcp-storage',
      // On rehydration, sync with manager
      onRehydrateStorage: () => (state) => {
        if (state) {
          mcpManager.initialize({
            addedMCPs: state.addedMCPs,
            enabledMCPs: state.enabledMCPs,
          })
        }
      },
    },
  ),
)

