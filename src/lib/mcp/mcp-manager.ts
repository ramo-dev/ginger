/**
 * Centralized MCP Manager
 * Single source of truth for MCP lifecycle management
 * 
 * Responsibilities:
 * - Manage user's added MCPs (subset of catalog)
 * - Track installation status
 * - Coordinate enable/disable state
 * - Provide unified API for all MCP operations
 */

import type { MCPId, MCPConfig, EnabledMCPs } from './mcp-config'
import { getMCPById } from './mcp-config'

/**
 * Result type for async operations
 */
export interface MCPOperationResult {
    success: boolean
    message: string
    error?: string
}

/**
 * MCP with enriched status information
 */
export interface EnrichedMCP extends MCPConfig {
    isAdded: boolean
    isInstalled: boolean
    isEnabled: boolean
    version?: string
}

/**
 * Validation result for MCP state
 */
export interface MCPValidationResult {
    valid: boolean
    issues: string[]
    warnings: string[]
}

/**
 * MCP Manager Class
 * Centralized management for all MCP operations
 */
export class MCPManager {
    private addedMCPs: Set<MCPId>
    private installedMCPs: Map<string, boolean>
    private enabledMCPs: EnabledMCPs

    constructor() {
        this.addedMCPs = new Set()
        this.installedMCPs = new Map()
        this.enabledMCPs = {}
    }

    /**
     * Initialize manager with current state
     */
    initialize(state: {
        addedMCPs?: Set<MCPId> | MCPId[]
        installedMCPs?: Map<string, boolean> | Record<string, boolean>
        enabledMCPs?: EnabledMCPs
    }) {
        // Handle addedMCPs
        if (state.addedMCPs) {
            this.addedMCPs = Array.isArray(state.addedMCPs)
                ? new Set(state.addedMCPs)
                : state.addedMCPs
        }

        // Handle installedMCPs
        if (state.installedMCPs) {
            this.installedMCPs = state.installedMCPs instanceof Map
                ? state.installedMCPs
                : new Map(Object.entries(state.installedMCPs))
        }

        // Handle enabledMCPs
        if (state.enabledMCPs) {
            this.enabledMCPs = state.enabledMCPs
        }
    }

    /**
     * Get user's added MCPs (their selected collection)
     */
    getAddedMCPs(): MCPId[] {
        return Array.from(this.addedMCPs)
    }

    /**
     * Check if an MCP is added to user's collection
     */
    isAdded(id: MCPId): boolean {
        return this.addedMCPs.has(id)
    }

    /**
     * Add an MCP to user's collection
     * This doesn't install it, just marks it as "wanted"
     */
    addMCP(id: MCPId): MCPOperationResult {
        const config = getMCPById(id)

        if (!config) {
            return {
                success: false,
                message: `MCP "${id}" not found in registry`,
                error: 'MCP_NOT_FOUND'
            }
        }

        if (this.addedMCPs.has(id)) {
            return {
                success: false,
                message: `MCP "${config.name}" is already in your collection`,
                error: 'ALREADY_ADDED'
            }
        }

        this.addedMCPs.add(id)

        return {
            success: true,
            message: `Added "${config.name}" to your tools`
        }
    }

    /**
     * Remove an MCP from user's collection
     * This will also disable it if enabled
     */
    removeMCP(id: MCPId): MCPOperationResult {
        const config = getMCPById(id)

        if (!config) {
            return {
                success: false,
                message: `MCP "${id}" not found`,
                error: 'MCP_NOT_FOUND'
            }
        }

        if (!this.addedMCPs.has(id)) {
            return {
                success: false,
                message: `MCP "${config.name}" is not in your collection`,
                error: 'NOT_ADDED'
            }
        }

        this.addedMCPs.delete(id)

        // Also disable if it was enabled
        if (this.enabledMCPs[id]) {
            delete this.enabledMCPs[id]
        }

        return {
            success: true,
            message: `Removed "${config.name}" from your tools`
        }
    }

    /**
     * Update installation status for an MCP
     */
    setInstallationStatus(id: string, installed: boolean) {
        this.installedMCPs.set(id, installed)
    }

    /**
     * Check if an MCP is installed
     */
    isInstalled(id: string): boolean {
        return this.installedMCPs.get(id) ?? false
    }

    /**
     * Get all installed MCPs
     */
    getInstalledMCPs(): string[] {
        return Array.from(this.installedMCPs.entries())
            .filter(([_, installed]) => installed)
            .map(([id]) => id)
    }

    /**
     * Update enabled MCPs state
     */
    setEnabledMCPs(enabledMCPs: EnabledMCPs) {
        this.enabledMCPs = enabledMCPs
    }

    /**
     * Get enabled MCPs
     */
    getEnabledMCPs(): EnabledMCPs {
        return this.enabledMCPs
    }

    /**
     * Check if an MCP is enabled
     */
    isEnabled(id: MCPId): boolean {
        return this.enabledMCPs[id] ?? false
    }

    /**
     * Get enriched MCP information
     */
    getEnrichedMCP(id: MCPId): EnrichedMCP | null {
        const config = getMCPById(id)
        if (!config) return null

        return {
            ...config,
            isAdded: this.isAdded(id),
            isInstalled: this.isInstalled(id) || this.isInstalled(config.name),
            isEnabled: this.isEnabled(id)
        }
    }

    /**
     * Get all enriched MCPs (only added ones)
     */
    getEnrichedAddedMCPs(): EnrichedMCP[] {
        return this.getAddedMCPs()
            .map(id => this.getEnrichedMCP(id))
            .filter((mcp): mcp is EnrichedMCP => mcp !== null)
    }

    /**
     * Validate MCP state consistency
     */
    validateState(): MCPValidationResult {
        const issues: string[] = []
        const warnings: string[] = []

        // Check if enabled MCPs are also added
        Object.keys(this.enabledMCPs).forEach(id => {
            if (this.enabledMCPs[id as MCPId] && !this.addedMCPs.has(id as MCPId)) {
                warnings.push(`MCP "${id}" is enabled but not in your collection`)
            }
        })

        // Check if added MCPs exist in registry
        this.addedMCPs.forEach(id => {
            const config = getMCPById(id)
            if (!config) {
                issues.push(`Added MCP "${id}" not found in registry`)
            }
        })

        return {
            valid: issues.length === 0,
            issues,
            warnings
        }
    }

    /**
     * Auto-fix state inconsistencies
     */
    autoFixState(): { fixed: number; issues: string[] } {
        let fixed = 0
        const issues: string[] = []

        // Auto-add enabled MCPs that aren't in collection
        Object.keys(this.enabledMCPs).forEach(id => {
            if (this.enabledMCPs[id as MCPId] && !this.addedMCPs.has(id as MCPId)) {
                const config = getMCPById(id as MCPId)
                if (config) {
                    this.addedMCPs.add(id as MCPId)
                    fixed++
                }
            }
        })

        // Remove added MCPs that don't exist in registry
        const toRemove: MCPId[] = []
        this.addedMCPs.forEach(id => {
            const config = getMCPById(id)
            if (!config) {
                toRemove.push(id)
                issues.push(`Removed invalid MCP "${id}" from collection`)
            }
        })
        toRemove.forEach(id => this.addedMCPs.delete(id))
        fixed += toRemove.length

        return { fixed, issues }
    }

    /**
     * Export current state for persistence
     */
    exportState() {
        return {
            addedMCPs: Array.from(this.addedMCPs),
            installedMCPs: Object.fromEntries(this.installedMCPs),
            enabledMCPs: this.enabledMCPs
        }
    }

    /**
     * Get statistics about current state
     */
    getStats() {
        const added = this.addedMCPs.size
        const installed = Array.from(this.installedMCPs.values()).filter(Boolean).length
        const enabled = Object.values(this.enabledMCPs).filter(Boolean).length

        return {
            added,
            installed,
            enabled,
            notInstalled: added - installed,
            installedButDisabled: installed - enabled
        }
    }
}

/**
 * Singleton instance for global use
 */
export const mcpManager = new MCPManager()
