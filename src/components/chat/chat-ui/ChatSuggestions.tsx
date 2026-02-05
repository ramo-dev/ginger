import { SUGGESTIONS } from "@/lib/constants"
import {
    Button
} from "@/components/ui/button";
import { RiBarChartLine } from "@remixicon/react"




interface SuggestionsComponentProps {
  onSuggestionClick: (suggestion: string) => void;
}


const ChatSuggestions = ({ onSuggestionClick} : SuggestionsComponentProps) => {
  return (
    <div className="grid w-full grid-cols-2 gap-3 pb-6 md:px-0 px-2">
      {SUGGESTIONS.map((suggestion, index) => (
        <div
          key={suggestion.prompt}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDelay: `${200 + index * 100}ms` }}
        >
            <Button
              variant="outline"
              className="group relative flex h-auto w-full flex-col items-start justify-start gap-3 rounded-xl border-border/50 bg-background p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
              aria-label={suggestion.prompt}
              onClick={() => onSuggestionClick(suggestion.prompt)}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex size-8 items-center justify-center rounded-full bg-accent/20 text-primary transition-colors group-hover:bg-primary/10">
                  <suggestion.icon size={18} />
                </div>
                {/* Subtle arrow that appears on hover */}
                <span className="opacity-0 transition-opacity group-hover:opacity-100">
                  <RiBarChartLine
                    size={14}
                    className="rotate-45 text-muted-foreground"
                  />
                </span>
              </div>

              <div className="space-y-1">
                <p className="font-semibold sm:text-base text-xs leading-none tracking-tight">
                  {suggestion.title}
                </p>
                <p className="line-clamp-1 text-wrap text-xs text-muted-foreground">
                  {suggestion.label}
                </p>
              </div>
            </Button>
        </div>
      ))}
    </div>
  )
}


export default ChatSuggestions