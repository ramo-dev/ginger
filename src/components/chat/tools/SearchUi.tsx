"use client";

import { z } from "zod";
import type { Toolkit } from "@assistant-ui/react";
import {
  RiArrowRightUpLine,
  RiCheckboxCircleFill,
  RiDatabase2Line,
  RiFileSearchLine,
  RiGlobalLine,
  RiLoader4Line,
  RiNodeTree,
  RiSearchLine,
  RiShareForwardLine,
} from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type SearchResult = {
  content: Array<{
    type: string;
    text: string;
    url?: string;
  }>;
  isError: boolean;
};

type Source = {
  id: number;
  title: string;
  url: string;
  hostname: string;
  summary: string;
};

const parseSearchData = (rawText: string) => {
  if (!rawText) return { sources: [], cleanText: "" };

  const sourceRegex =
    /(\d+)\.\s+(.*?)\s+URL:\s+(https?:\/\/[^\s]+)\s+Summary:\s+(.*?)(?=\s+\d+\.\s+|$)/gs;
  const sources: Source[] = [];
  let match;

  while ((match = sourceRegex.exec(rawText)) !== null) {
    try {
      const url = match[3].trim();
      sources.push({
        id: parseInt(match[1]),
        title: match[2].trim(),
        url: url,
        hostname: new URL(url).hostname.replace("www.", ""),
        summary: match[4].trim(),
      });
    } catch (e) {
      console.error("Parse Error", e);
    }
  }

  const cleanText = rawText
    .split(/Found \d+ search results:/)[0]
    .replace(/\d+\. .*? URL: https?:\/\/.* Summary: .*/gs, "")
    .trim();

  return { sources, cleanText };
};

const SEARCH_ACTIVITIES = [
  {
    label: "Semantic Analysis",
    detail: "Parsing intent & entities",
    icon: <RiFileSearchLine className="size-3" />,
  },
  {
    label: "Neural Expansion",
    detail: "Broadening context window",
    icon: <RiNodeTree className="size-3" />,
  },
  {
    label: "Index Discovery",
    detail: "Scanning global clusters",
    icon: <RiDatabase2Line className="size-3" />,
  },
  {
    label: "Source Retrieval",
    detail: "Fetching authority signals",
    icon: <RiShareForwardLine className="size-3" />,
  },
];

// Search UI Component
const SearchUIComponent = ({ result, args }: { result: SearchResult | undefined; args: { query: string } }) => {
  const { query } = args;
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(),
  );
  const [isFinalizing, setIsFinalizing] = useState(false);

  const steps = useMemo(() => {
    return SEARCH_ACTIVITIES.map((activity, index) => ({
      id: `step-${index}`,
      ...activity,
      delay: 400 + index * 300,
    }));
  }, []);

  const { sources, cleanText } = useMemo(() => {
    const rawText = (result as SearchResult)?.content?.[0]?.text || "";
    return parseSearchData(rawText);
  }, [result]);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    steps.forEach((step) => {
      const timeout = setTimeout(() => {
        setCompletedSteps((prev) => new Set([...prev, step.id]));
      }, step.delay);
      timers.push(timeout);
    });

    if (result !== undefined) {
      const finalTimer = setTimeout(() => setIsFinalizing(true), 1200);
      timers.push(finalTimer);
    }

    return () => timers.forEach(clearTimeout);
  }, [result, steps]);

  return (
    <div
      className={cn(
        "my-6 w-full overflow-hidden transition-all duration-700",
      )}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-input/40 bg-muted/10 py-3">
        <div className="flex items-center gap-3 py-1 overflow-hidden">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background border border-input">
            <RiSearchLine
              className={cn(
                "size-3.5 transition-colors",
                isFinalizing
                  ? "text-muted-foreground"
                  : "animate-pulse text-primary",
              )}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground/60">
              Search Engine
            </span>
            <span className="truncate text-xs font-semibold tracking-tight leading-none italic opacity-90">
              "{query}"
            </span>
          </div>
        </div>
      </div>

      <div className="py-3 flex flex-col gap-8">
        {/* 1. LOADERS (Stays Vertical) */}
        <div
          className={cn(
            "flex flex-col gap-4 transition-all duration-700",
            isFinalizing ? "opacity-80 pointer-events-none" : "opacity-100",
          )}
        >
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isActive =
              !isCompleted &&
              (index === 0 || completedSteps.has(steps[index - 1].id));
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 transition-all duration-300",
                  isCompleted || isActive ? "opacity-100" : "opacity-0",
                )}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "z-10 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-500 bg-background",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input",
                      isActive && "ring-4 ring-primary/10 border-primary/50",
                    )}
                  >
                    {isCompleted ? (
                      <RiCheckboxCircleFill className="size-3" />
                    ) : isActive ? (
                      <RiLoader4Line className="size-3 animate-spin text-primary" />
                    ) : (
                      <div className="size-1 rounded-full bg-muted" />
                    )}
                  </div>
                  {/* Connector Line */}
                  {index !== steps.length - 1 && (
                    <div className="absolute top-5 h-4 w-[1px] bg-input" />
                  )}
                </div>
                <span className="text-[11px] font-bold tracking-tight text-foreground uppercase">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2. RESULTS & SOURCES (Appears below loaders) */}
        {isFinalizing && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-both">
            {/* Synthesis Section */}
            <div className="space-y-4">
              <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-medium">
                <ReactMarkdown>{cleanText}</ReactMarkdown>
              </div>
            </div>

            {/* Citations Section (Horizontal Scroll) */}
            {sources.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-input/40">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                  Citations
                </span>

                <div className="relative">
                  {/* Container for horizontal scroll */}
                  <div className="flex gap-4 overflow-x-auto pb-4 pt-1 -mx-1 px-1 scrollbar-hide">
                    {sources.map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-none w-[220px] md:w-[260px] group rounded-xl border border-input bg-muted/20 p-4 transition-all hover:bg-muted/40 hover:border-primary/30  flex flex-col justify-between h-[100px]"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-background border border-input">
                              <RiGlobalLine className="size-3 text-muted-foreground" />
                            </div>
                            <span className="text-[10px] font-bold truncate text-muted-foreground/80 uppercase">
                              {source.hostname}
                            </span>
                          </div>
                          <RiArrowRightUpLine className="size-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5 text-primary" />
                        </div>
                        <p className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {source.title}
                        </p>
                      </a>
                    ))}
                  </div>
                  {/* Gradient overlay to indicate more sources */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-card to-transparent" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Search Toolkit - UI only, execution handled by MCP backend
export const SearchToolkit: Toolkit = {
  search: {
    description: "Search the web for information",
    parameters: z.object({
      query: z.string().describe("The search query"),
    }),
    // No execute function - handled by MCP backend
    render: ({ args, result }) => {
      console.log('🔍 [SEARCH UI] Render called:', { 
        query: args.query,
        hasResult: result !== undefined
      });
      
      return <SearchUIComponent result={result} args={args} />;
    },
  },
};
