# MCP UI Components

This folder contains all MCP (Model Context Protocol) related UI components for the application.

## Structure

```
mcp-ui/
├── index.ts              # Centralized exports
├── mcp-tool-ui.tsx       # Main MCP management popover
├── mcp-install-dialog.tsx # Installation/uninstallation dialog
└── README.md             # This file
```

## Components

### MCPToolPopover

The main UI component for managing MCP extensions. Features:

- Browse available MCPs from Docker catalog
- View installation status
- Install/uninstall MCPs
- Sort and filter functionality
- Pagination for large catalogs
- Error handling with helpful guidance

### MCPInstallDialog

Dialog component for confirming MCP installation/uninstallation:

- Shows MCP details
- Progress indicators
- Success/error feedback
- Auto-close on success

## Usage

```typescript
// Import from the centralized index
import { MCPToolPopover, MCPInstallDialog } from '@/components/mcp-ui'

// Use in any client component
<MCPToolPopover />
```

## Dependencies

These components depend on:

- `@/hooks/use-mcp-management` - MCP state management
- `@/lib/store/mcp-store` - MCP preferences store
- `@/lib/mcp/mcp.server` - Server-side MCP functions
- Various UI components from `@/components/ui/*`
