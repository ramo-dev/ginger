"use client";

import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";

interface SuggestionsComponentProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const SuggestionsComponent = ({
  suggestions,
  onSuggestionClick,
}: SuggestionsComponentProps) => {
  return (
    <Suggestions className="px-4">
      {suggestions.map((suggestion) => (
        <Suggestion
          key={suggestion}
          onClick={() => onSuggestionClick(suggestion)}
          suggestion={suggestion}
        />
      ))}
    </Suggestions>
  );
};
