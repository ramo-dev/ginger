# MCP Centralization Implementation Plan

## Overview
This plan outlines the architecture for centralizing MCP (Model Context Protocol) connection management in the Ginger application. The goal is to create a unified system where MCP tools are managed through Docker CLI, with a settings UI that controls which tools are enabled.

## Current State Analysis

### Existing Components

1. **`src/lib/mcp/`** - Core MCP logic
   - `mcp-config.ts` - Hardcoded MCP registry (single source of truth)
   - `mcp-client.ts` - Client creation and management
   - `mcp.server.ts` - Server functions for Docker catalog interaction
   - `mcp-custom.ts` - Legacy custom MCP setup (to be deprecated)
   - `mcp-manager.ts` - Empty file (to be implemented)

2. **`src/server/mcp/`** - Server-side MCP
   - `index.ts` - Legacy hardcoded DuckDuckGo setup (to be deprecated)

3. **`src/components/mcp-ui/`** - UI Components
   - `mcp-tool-ui.tsx` - Popover UI for managing MCPs (shows ALL catalog tools)
   - `mcp-install-dialog.tsx` - Installation/uninstallation dialog

4. **`src/components/chat/settings/tabs/mcp/`** - Settings page (empty, needs implementation)

5. **State Management**
   - `src/lib/store/mcp-store.ts` - Zustand store for enabled MCPs
   - `src/hooks/use-mcp-management.ts` - Hook for MCP catalog and installation

### Current Issues

1. **`mcp-tool-ui.tsx` shows ALL catalog tools** - Should only show tools added in settings
2. **No MCP settings page** - Empty directory at `settings/tabs/mcp/`
3. **Fragmented architecture** - Multiple places manage MCP state
4. **Legacy code** - Old implementations need cleanup
5. **No centralized manager** - `mcp-manager.ts` is empty

## Proposed Architecture

### 1. Centralized MCP Manager (`src/lib/mcp/mcp-manager.ts`)

**Purpose**: Single source of truth for MCP lifecycle management

**Responsibilities**:
- Manage MCP installation state
- Track which MCPs are "added" (user-selected from catalog)
- Track which MCPs are "enabled" (active in chat)
- Coordinate between Docker CLI and application state
- Provide unified API for all MCP operations

**Key Functions**:
```typescript
// User's selected MCPs (subset of catalog)
- getAddedMCPs(): MCPConfig[]
- addMCP(id: string): Promise<void>
- removeMCP(id: string): Promise<void>

// Installation status
- getInstalledMCPs(): Promise<InstalledMCP[]>
- installMCP(id: string): Promise<Result>
- uninstallMCP(id: string): Promise<Result>

// Enable/disable for chat
- getEnabledMCPs(): EnabledMCPs
- enableMCP(id: string): void
- disableMCP(id: string): void

// Sync operations
- syncWithDocker(): Promise<void>
- validateMCPState(): Promise<ValidationResult>
```

### 2. Enhanced MCP Store (`src/lib/store/mcp-store.ts`)

**Add new state**:
```typescript
interface MCPStore {
  // Existing
  enabledMCPs: EnabledMCPs
  
  // NEW: User's selected MCPs from catalog
  addedMCPs: Set<MCPId>
  
  // NEW: Actions
  addMCP: (id: MCPId) => void
  removeMCP: (id: MCPId) => void
  setAddedMCPs: (ids: Set<MCPId>) => void
  
  // Existing actions remain
  toggleMCP: (id: MCPId) => void
  enableMCP: (id: MCPId) => void
  disableMCP: (id: MCPId) => void
  // ...
}
```

### 3. MCP Settings Page (`src/components/chat/settings/tabs/mcp/mcp-settings.tsx`)

**Purpose**: Primary interface for managing MCPs

**Features**:
1. **Browse Docker Catalog** - Search and filter available MCPs
2. **Add/Remove MCPs** - Select which tools to make available
3. **Install/Uninstall** - Pull Docker images via `docker mcp server enable <name>`
4. **Enable/Disable** - Toggle which installed MCPs are active

**UI Structure**:
```
┌─────────────────────────────────────────────┐
│ MCP Tools & Extensions                      │
├─────────────────────────────────────────────┤
│ [Search catalog...]              [+ Browse] │
├─────────────────────────────────────────────┤
│                                             │
│ Your Tools (3)                              │
│ ┌─────────────────────────────────────────┐ │
│ │ ✓ Playwright          [Installed] [✓]   │ │
│ │   Web automation                         │ │
│ │   [Uninstall] [Settings]                │ │
│ ├─────────────────────────────────────────┤ │
│ │ ⚠ DuckDuckGo          [Not Installed]   │ │
│ │   Web search                             │ │
│ │   [Install]                              │ │
│ ├─────────────────────────────────────────┤ │
│ │ ✓ Memory              [Installed] [✓]   │ │
│ │   Persistent storage                     │ │
│ │   [Uninstall] [Settings]                │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Available in Catalog (24)                   │
│ [View All] [Categories ▼]                   │
└─────────────────────────────────────────────┘
```

### 4. Refactored MCP Tool UI (`src/components/mcp-ui/mcp-tool-ui.tsx`)

**Changes**:
- **Filter to show ONLY added MCPs** (not entire catalog)
- Remove "Install" functionality (move to settings)
- Focus on quick enable/disable toggle
- Show status indicators
- Link to settings for management

**Updated UI**:
```
┌─────────────────────────────────┐
│ Tool Extensions          [3/3]  │
├─────────────────────────────────┤
│ [Search your tools...]          │
├─────────────────────────────────┤
│ ✓ Playwright            [✓]     │
│ ✓ DuckDuckGo            [✓]     │
│ ✓ Memory                [✓]     │
├─────────────────────────────────┤
│ [⚙ Manage Tools]                │
└─────────────────────────────────┘
```

### 5. Docker Integration

**Commands to use**:
```bash
# Browse catalog
docker mcp catalog show --format=json

# List installed
docker mcp server list --json

# Install (pull image + enable)
docker mcp server enable <mcp-name>

# Uninstall
docker mcp server disable <mcp-name>
# or
docker mcp server remove <mcp-name>
```

**Implementation**:
- Update `mcp.server.ts` to implement install/uninstall
- Use dynamic MCP names from UI
- Handle errors gracefully (Docker not running, etc.)

## Implementation Phases

### Phase 1: Core Infrastructure ✅ PRIORITY
**Goal**: Set up centralized management layer

**Tasks**:
1. ✅ Implement `mcp-manager.ts` with core functions
2. ✅ Update `mcp-store.ts` to include `addedMCPs` state
3. ✅ Update `use-mcp-management.ts` to use manager
4. ✅ Implement install/uninstall in `mcp.server.ts`

**Files to modify**:
- `src/lib/mcp/mcp-manager.ts` (implement)
- `src/lib/store/mcp-store.ts` (add addedMCPs)
- `src/hooks/use-mcp-management.ts` (integrate manager)
- `src/lib/mcp/mcp.server.ts` (implement install/uninstall)

### Phase 2: Settings Page ✅ PRIORITY
**Goal**: Create primary MCP management interface

**Tasks**:
1. ✅ Create `mcp-settings.tsx` component
2. ✅ Implement catalog browsing with search/filter
3. ✅ Add/remove MCPs to user's collection
4. ✅ Install/uninstall functionality
5. ✅ Enable/disable toggles
6. ✅ Wire up to settings dialog

**Files to create**:
- `src/components/chat/settings/tabs/mcp/mcp-settings.tsx`
- `src/components/chat/settings/tabs/mcp/mcp-catalog-browser.tsx` (optional)
- `src/components/chat/settings/tabs/mcp/mcp-tool-card.tsx` (optional)

**Files to modify**:
- `src/components/chat/settings/settings-dialog.tsx` (add MCP tab content)

### Phase 3: Refactor Tool UI ✅ PRIORITY
**Goal**: Simplify popover to show only added tools

**Tasks**:
1. ✅ Filter `mcpTools` to only show added MCPs
2. ✅ Remove install/uninstall buttons
3. ✅ Add "Manage Tools" button linking to settings
4. ✅ Simplify UI for quick enable/disable
5. ✅ Update empty state messaging

**Files to modify**:
- `src/components/mcp-ui/mcp-tool-ui.tsx`

### Phase 4: Cleanup & Migration
**Goal**: Remove legacy code and consolidate

**Tasks**:
1. ⚠️ Deprecate `src/server/mcp/index.ts` (old hardcoded setup)
2. ⚠️ Deprecate `src/lib/mcp/mcp-custom.ts` (legacy)
3. ✅ Update all imports to use centralized manager
4. ✅ Add migration logic for existing users
5. ✅ Update documentation

**Files to modify/remove**:
- `src/server/mcp/index.ts` (deprecate or refactor)
- `src/lib/mcp/mcp-custom.ts` (remove)
- Update any components importing old code

### Phase 5: Polish & UX
**Goal**: Enhance user experience

**Tasks**:
1. ⚙️ Add loading states and error handling
2. ⚙️ Implement optimistic updates
3. ⚙️ Add toast notifications for actions
4. ⚙️ Implement MCP configuration UI (for secrets, env vars)
5. ⚙️ Add help tooltips and documentation links
6. ⚙️ Implement MCP health checks

## Data Flow

### Adding an MCP
```
User clicks "Add" in Settings
  ↓
MCPStore.addMCP(id)
  ↓
MCPManager.addMCP(id)
  ↓
Persist to localStorage/server
  ↓
UI updates to show in "Your Tools"
```

### Installing an MCP
```
User clicks "Install" in Settings
  ↓
MCPManager.installMCP(id)
  ↓
Execute: docker mcp server enable <name>
  ↓
Poll installation status
  ↓
Update installedMCPs cache
  ↓
Auto-enable if successful
  ↓
UI shows "Installed" badge
```

### Enabling an MCP
```
User toggles switch in Tool UI
  ↓
MCPStore.enableMCP(id)
  ↓
Sync to server preferences
  ↓
Chat uses enabled MCPs for tool calls
```

### Tool UI Display Logic
```
Get all catalog MCPs
  ↓
Filter by addedMCPs (user's selection)
  ↓
Enrich with installation status
  ↓
Show only added MCPs in popover
```

## State Persistence

### LocalStorage (via Zustand)
```typescript
{
  "mcp-storage": {
    "enabledMCPs": { "playwright": true, "duckduckgo": true },
    "addedMCPs": ["playwright", "duckduckgo", "memory"]
  }
}
```

### Server Preferences API
```typescript
{
  "mcp": {
    "enabledMCPs": { "playwright": true, "duckduckgo": true },
    "addedMCPs": ["playwright", "duckduckgo", "memory"],
    "configs": {
      "playwright": { /* custom config */ }
    }
  }
}
```

## Developer Experience

### Adding a new MCP (for devs)
1. Add to `mcp-config.ts` registry (optional, for defaults)
2. Users can discover via Docker catalog
3. No code changes needed for catalog MCPs

### User Experience

### Adding a new MCP (for users)
1. Open Settings → Tools & MCPs
2. Click "Browse Catalog"
3. Search/filter for desired tool
4. Click "Add to My Tools"
5. Click "Install" to pull Docker image
6. Toggle switch to enable in chat

### Using MCPs in chat
1. Click MCP tool icon in chat
2. See only added tools
3. Quick toggle to enable/disable
4. Tools immediately available in conversation

## Testing Strategy

### Unit Tests
- MCPManager functions
- Store actions and selectors
- Docker command execution mocks

### Integration Tests
- Settings page workflows
- Tool UI filtering
- Install/uninstall flows

### E2E Tests
- Complete user journey: browse → add → install → enable → use
- Error scenarios (Docker not running, network issues)
- State persistence across sessions

## Migration Strategy

### For Existing Users
1. Detect existing `enabledMCPs` in store
2. Auto-populate `addedMCPs` from enabled MCPs
3. Show migration notice in settings
4. Preserve all existing preferences

### Backward Compatibility
- Keep existing MCP registry as defaults
- Gracefully handle missing Docker
- Fallback to hardcoded MCPs if catalog unavailable

## Success Metrics

1. ✅ Only added MCPs show in tool popover
2. ✅ Settings page is primary MCP management interface
3. ✅ Docker CLI integration works seamlessly
4. ✅ No hardcoded MCP connections in code
5. ✅ Users can add/remove MCPs without code changes
6. ✅ Clear separation: Settings (manage) vs Popover (quick toggle)

## Open Questions

1. **Q**: Should we auto-install when user adds an MCP?
   **A**: No, keep add and install separate for transparency

2. **Q**: What happens if Docker is not running?
   **A**: Show helpful error, allow browsing catalog, disable install actions

3. **Q**: Should we cache Docker catalog?
   **A**: Yes, with 30min stale time, manual refresh option

4. **Q**: How to handle MCP configuration (secrets, env vars)?
   **A**: Phase 5 - Add config UI per MCP in settings

5. **Q**: Should we support custom MCP servers (non-Docker)?
   **A**: Future enhancement - add "Custom MCP" option in settings

## File Structure Summary

```
src/
├── lib/
│   ├── mcp/
│   │   ├── mcp-config.ts          # Registry (single source of truth)
│   │   ├── mcp-manager.ts         # ✨ NEW: Centralized manager
│   │   ├── mcp-client.ts          # Client creation
│   │   ├── mcp.server.ts          # Docker CLI integration
│   │   └── mcp-custom.ts          # ⚠️ DEPRECATED
│   └── store/
│       └── mcp-store.ts           # ✨ UPDATED: Add addedMCPs
├── hooks/
│   └── use-mcp-management.ts      # ✨ UPDATED: Use manager
├── components/
│   ├── mcp-ui/
│   │   ├── mcp-tool-ui.tsx        # ✨ UPDATED: Filter to added only
│   │   └── mcp-install-dialog.tsx # Reusable dialog
│   └── chat/
│       └── settings/
│           └── tabs/
│               └── mcp/
│                   └── mcp-settings.tsx  # ✨ NEW: Main settings UI
└── server/
    └── mcp/
        └── index.ts               # ⚠️ DEPRECATED
```

## Notes for Implementation

### Keep It Simple
- Start with core functionality (add, install, enable)
- Polish UX in later phases
- Prioritize reliability over features

### User-Friendly
- Clear error messages
- Loading indicators
- Helpful tooltips
- Link to Docker documentation

### Developer-Friendly
- Well-documented code
- Type-safe APIs
- Easy to extend
- Clear separation of concerns

### Maintainable
- Single source of truth (mcp-manager)
- Centralized state (mcp-store)
- Reusable components
- Consistent patterns

---

**Status**: Ready for implementation
**Priority**: High
**Estimated Effort**: 2-3 days
**Dependencies**: Docker Desktop, existing MCP infrastructure
