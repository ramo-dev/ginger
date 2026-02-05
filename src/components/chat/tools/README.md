# Tools Architecture

This directory contains a scalable architecture for adding both UI and server tools to your chat application, similar to how Next.js themes work.

## Architecture Overview

### Backend Tools (`/src/app/(chat)/api/chat/tools/`)
- **`index.ts`**: Centralized registry that exports all tools
- **`weather.ts`**: Weather-related tools
- **`calculator.ts`**: Mathematical calculation tools

### Frontend Tool UIs (`/src/components/chat/tools/`)
- **`ToolProvider.tsx`**: Provider component that renders all tool UI components (like a theme provider)
- **`WeatherTool.tsx`**: Weather tool UI component built with `makeAssistantToolUI`
- **`CalculatorTool.tsx`**: Calculator tool UI component built with `makeAssistantToolUI`

## How to Add a New Tool

### 1. Create the Backend Tool

Create a new file in `/src/app/(chat)/api/chat/tools/`:

```typescript
// example: file-search.ts
import { tool } from "ai";
import { zodSchema } from "ai";
import { z } from "zod";

export const tools = {
  searchFiles: tool({
    description: "Search for files in the project",
    inputSchema: zodSchema(
      z.object({
        query: z.string().describe("Search query"),
        fileTypes: z.array(z.string()).optional().describe("File extensions to search"),
      }),
    ),
    execute: async ({ query, fileTypes }) => {
      // Your tool logic here
      return {
        results: [], // Your results
        count: 0,
      };
    },
  }),
};
```

### 2. Register the Backend Tool

Update `/src/app/(chat)/api/chat/tools/index.ts`:

```typescript
import { tools as fileSearchTools } from "./file-search";

export const tools = {
  ...weatherTools,
  ...calculatorTools,
  ...fileSearchTools, // Add this line
};
```

### 3. Create the UI Component

Create a new file in `/src/components/chat/tools/`:

```typescript
// FileSearchTool.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { makeAssistantToolUI } from "@assistant-ui/react";

const FileSearchToolUI = makeAssistantToolUI<
  { query: string; fileTypes?: string[] },
  { results: any[]; count: number }
>({
  toolName: "searchFiles",
  render: ({ args, result, status }) => {
    const isLoading = status.type === "running";
    const isError = status.type === "incomplete" && status.reason === "error";
    
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            File Search
            <Badge variant={isLoading ? "secondary" : isError ? "destructive" : "default"}>
              {isLoading ? "Searching..." : isError ? "Error" : "Complete"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Your UI here */}
        </CardContent>
      </Card>
    );
  },
});

export default FileSearchToolUI;
```

### 4. Add to ToolProvider

Update `/src/components/chat/tools/ToolProvider.tsx`:

```typescript
import FileSearchToolUI from "./FileSearchTool";

export const ToolProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <WeatherToolUI />
      <CalculatorToolUI />
      <FileSearchToolUI /> // Add this line
      {children}
    </>
  );
};
```

## Important Notes

- **Provider Pattern**: ToolProvider works like a theme provider, importing and rendering tool UI components
- **makeAssistantToolUI**: Automatically registers tools with the Assistant UI system
- **Component Structure**: Each tool UI is a separate component built with `makeAssistantToolUI`
- **Type Safety**: Full TypeScript support with proper type definitions

## Benefits of This Architecture

1. **Scalability**: Easy to add new tools by creating UI components and adding to provider
2. **Separation of Concerns**: Backend logic separated from UI components
3. **Provider Pattern**: Clean, theme-like architecture for tool management
4. **Type Safety**: Full TypeScript support throughout
5. **Consistency**: Standardized patterns for tool creation
6. **Modularity**: Each tool is a self-contained component

## Usage

The `ToolProvider` component wraps your chat interface and renders all tool UI components:

```tsx
<ToolProvider>
  <YourChatInterface />
</ToolProvider>
```

All tools defined with `makeAssistantToolUI` will be automatically available in the chat when the AI needs them.
