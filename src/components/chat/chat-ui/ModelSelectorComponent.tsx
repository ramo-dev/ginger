"use client";

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { CheckIcon } from "lucide-react";
import { PromptInputButton } from "@/components/ai-elements/prompt-input";

interface ModelType {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
}

interface ModelSelectorComponentProps {
  model: string;
  setModel: (model: string) => void;
  modelSelectorOpen: boolean;
  setModelSelectorOpen: (open: boolean) => void;
  models: ModelType[];
}

export const ModelSelectorComponent = ({
  model,
  setModel,
  modelSelectorOpen,
  setModelSelectorOpen,
  models,
}: ModelSelectorComponentProps) => {
  const selectedModelData = models.find((m) => m.id === model);

  return (
    <ModelSelector
      onOpenChange={setModelSelectorOpen}
      open={modelSelectorOpen}
    >
      <ModelSelectorTrigger>
        <PromptInputButton>
          {selectedModelData?.chefSlug && (
            <ModelSelectorLogo
              provider={selectedModelData.chefSlug}
            />
          )}
          {selectedModelData?.name && (
            <ModelSelectorName>
              {selectedModelData.name}
            </ModelSelectorName>
          )}
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {["OpenAI", "Anthropic", "Google"].map((chef) => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter((m) => m.chef === chef)
                .map((m) => (
                  <ModelSelectorItem
                    key={m.id}
                    onSelect={() => {
                      setModel(m.id);
                      setModelSelectorOpen(false);
                    }}
                    value={m.id}
                  >
                    <ModelSelectorLogo provider={m.chefSlug} />
                    <ModelSelectorName>{m.name}</ModelSelectorName>
                    <ModelSelectorLogoGroup>
                      {m.providers.map((provider) => (
                        <ModelSelectorLogo
                          key={provider}
                          provider={provider}
                        />
                      ))}
                    </ModelSelectorLogoGroup>
                    {model === m.id ? (
                      <CheckIcon className="ml-auto size-4" />
                    ) : (
                      <div className="ml-auto size-4" />
                    )}
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
};
