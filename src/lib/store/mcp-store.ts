import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnabledMCPs, MCPId } from '@/lib/mcp/mcp-config'

interface MCPStore {
  enabledMCPs: EnabledMCPs
  toggleMCP: (id: MCPId) => void
  enableMCP: (id: MCPId) => void
  disableMCP: (id: MCPId) => void
  setEnabledMCPs: (mcps: EnabledMCPs) => void
  resetMCPs: () => void
  syncToServer: () => Promise<void>
  loadFromServer: () => Promise<void>
}

export const useMCPStore = create<MCPStore>()(
  persist(
    (set, get) => ({
      enabledMCPs: {},

      toggleMCP: (id) => {
        set((state) => ({
          enabledMCPs: {
            ...state.enabledMCPs,
            [id]: !state.enabledMCPs[id],
          },
        }))
        // Auto-sync to server
        get().syncToServer()
      },

      enableMCP: (id) => {
        set((state) => ({
          enabledMCPs: {
            ...state.enabledMCPs,
            [id]: true,
          },
        }))
        // Auto-sync to server
        get().syncToServer()
      },

      disableMCP: (id) => {
        set((state) => ({
          enabledMCPs: {
            ...state.enabledMCPs,
            [id]: false,
          },
        }))
        // Auto-sync to server
        get().syncToServer()
      },

      setEnabledMCPs: (mcps) => {
        set({ enabledMCPs: mcps })
        // Auto-sync to server
        get().syncToServer()
      },

      resetMCPs: () => {
        set({ enabledMCPs: {} })
        // Auto-sync to server
        get().syncToServer()
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
              })
            }
          }
        } catch (error) {
          console.error('Failed to load MCP preferences:', error)
        }
      },
    }),
    {
      name: 'mcp-storage',
    },
  ),
)
