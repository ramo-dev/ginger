export interface ChangelogEntry {
  version: string;
  date: string;
  title?: string;
  changes: {
    type: "feature" | "fix" | "improvement" | "other";
    description: string;
  }[];
}

export const changelogData: ChangelogEntry[] = [
  {
    version: "0.1.0",
    date: "2026-02-01",
    title: "Initial Beta Release",
    changes: [
      {
        type: "feature",
        description:
          "Dual Model Support: Seekless switching between Local (Ollama) and Remote (OpenRouter) LLMs.",
      },
      {
        type: "feature",
        description:
          "MCP Support: Integrated Model Context Protocol support via Docker containers.",
      },
      {
        type: "feature",
        description:
          "Advanced Chat UI: Powered by Assistant UI with markdown support and streaming responses.",
      },
      {
        type: "improvement",
        description:
          "Settings Interface: Comprehensive settings for managing providers and models.",
      },
      {
        type: "fix",
        description:
          "Fixed Ollama API connection issues by ensuring correct base URL handling.",
      },
    ],
  },
];
