import { makeAssistantToolUI } from '@assistant-ui/react'
import { RiBookOpenLine, RiExternalLinkLine } from '@remixicon/react'
import ReactMarkdown from 'react-markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type FetchResult = {
  content: Array<{ type: string; text: string }>
  isError: boolean
}

export const FetchContentToolUI = makeAssistantToolUI({
  toolName: 'fetch_content',
  render: ({ result, args }) => {
    const { url } = args as { url: string }
    const rawText = (result as FetchResult)?.content?.[0]?.text || ''

    const previewText = rawText.slice(0, 300).trim() + '...'

    return (
      <div className="my-4 w-full rounded-xl border border-input bg-background p-1 shadow-sm">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-input/50">
          <div className="flex items-center gap-2">
            <RiBookOpenLine className="size-4 text-primary" />
            <span className="text-xs font-semibold truncate max-w-[200px]">
              {url || 'Source Content'}
            </span>
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <RiExternalLinkLine className="size-3.5" />
            </a>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="p-3">
          {result === undefined ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <div className="size-2 rounded-full bg-primary" />
              Reading page content...
            </div>
          ) : (
            <div className="space-y-3">
              {/* Short Summary/Preview */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{previewText}</p>
              </div>

              {/* Full Content Accordion */}
              <Accordion className="border-t pt-1">
                <AccordionItem value="full-text" className="border-none">
                  <AccordionTrigger className="py-2 text-[11px] font-bold uppercase tracking-wider hover:no-underline">
                    View Full Scrape
                  </AccordionTrigger>
                  <AccordionContent>
                    <ScrollArea className="h-[300px] w-full rounded-md border bg-muted/30 p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{rawText}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </div>
    )
  },
})
