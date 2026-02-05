"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageList } from "@/components/chat/chat-ui/MessageList";
import { ChatInput } from "@/components/chat/chat-ui/ChatInput";
import { ModelSelectorComponent } from "@/components/chat/chat-ui/ModelSelectorComponent";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input"
import {  useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useMCPStore } from "@/lib/store/mcp-store";
import { useModelStore } from "@/lib/store/model-store";
import ChatSuggestions from "../chat-ui/ChatSuggestions";


const models = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    chef: "OpenAI",
    chefSlug: "openai",
    providers: ["openai", "azure"],
  },
  {
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    chef: "Anthropic",
    chefSlug: "anthropic",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    chef: "Google",
    chefSlug: "google",
    providers: ["google"],
  },
];

const suggestions = [
  "What are the latest trends in AI?",
  "How does machine learning work?",
  "Explain quantum computing",
  "Best practices for React development",
  "Tell me about TypeScript benefits",
  "How to optimize database queries?",
  "What is the difference between SQL and NoSQL?",
  "Explain cloud computing basics",
];



const ChatLayout = () => {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const { enabledMCPs } = useMCPStore()
  const { selectedModelId, selectedProvider, ollamaBaseUrl } = useModelStore()
  const {messages, sendMessage, status, regenerate} = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        enabledMCPs,
        model: selectedModelId,
        provider: selectedProvider,
        ollamaUrl: ollamaBaseUrl,
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });
 




  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }


    if (message.files?.length) {
      toast.success("Files attached", {
        description: `${message.files.length} file(s) attached to message`,
      });
    }

    sendMessage(message);

    setText("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({
        text : suggestion
    })
  };

  return (
    <div className="relative max-h-screen h-full justify-between flex size-full flex-col overflow-hidden">
      <MessageList 
        regenerate={regenerate}
        messages={messages}
        status={status}
      />
      {!messages.length && (
        <div className="mt-auto max-w-3xl w-full mx-auto">
            <ChatSuggestions
            onSuggestionClick={handleSuggestionClick}
            />
        </div>
      )}
      <div className="grid shrink-0 gap-4 max-w-3xl w-full mx-auto pt-4">
        <ChatInput
          text={text}
          setText={setText}
          useWebSearch={useWebSearch}
          setUseWebSearch={setUseWebSearch}
          useMicrophone={useMicrophone}
          setUseMicrophone={setUseMicrophone}
          status={status}
          onSubmit={handleSubmit}
          ModelSelectorComponent={
            <ModelSelectorComponent
              model={model}
              setModel={setModel}
              modelSelectorOpen={modelSelectorOpen}
              setModelSelectorOpen={setModelSelectorOpen}
              models={models}
            />
          }
        />
      </div>
    </div>
  );
};

export default ChatLayout;
