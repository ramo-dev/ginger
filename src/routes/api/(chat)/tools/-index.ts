import { documentTools } from "./-document";

// Centralized tools registry
export const tools = {
  ...documentTools,
  // Add more tools here as they are created
};


// Helper function to register new tools
export const registerTool = (toolName: string, toolDefinition: any) => {
  (tools as any)[toolName] = toolDefinition;
};

// Export individual tool categories for modular imports
export { documentTools };

// Type definitions for better TypeScript support
export type ToolNames = keyof typeof tools;

