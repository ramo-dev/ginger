"use client";

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import { GlobeIcon, MicIcon } from "lucide-react";
import { MCPToolPopover } from '@/components/mcp-ui'
import { ModelPopover } from "../model-popover";

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <Attachment
          data={attachment}
          key={attachment.id}
          onRemove={() => attachments.remove(attachment.id)}
        >
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
};

interface ChatInputProps {
  text: string;
  setText: (text: string) => void;
  useWebSearch: boolean;
  setUseWebSearch: (useWebSearch: boolean) => void;
  useMicrophone: boolean;
  setUseMicrophone: (useMicrophone: boolean) => void;
  status: UseChatHelpers<UIMessage>["status"];
  onSubmit: (message: PromptInputMessage) => void;
  ModelSelectorComponent: React.ReactNode;
}

export const ChatInput = ({
  text,
  setText,
  useWebSearch,
  setUseWebSearch,
  useMicrophone,
  setUseMicrophone,
  status,
  onSubmit,
  ModelSelectorComponent,
}: ChatInputProps) => {
    
  return (
    <div className="w-full pb-4 sm:px-0 px-2">
      <PromptInput globalDrop multiple onSubmit={onSubmit}>
        <PromptInputHeader className="p-1">
          <PromptInputAttachmentsDisplay />
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(event) => setText(event.target.value)}
            value={text}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments/>
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton
              onClick={() => setUseWebSearch(!useWebSearch)}
              variant={useWebSearch ? "default" : "ghost"}
            >
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton>
            <ModelPopover/>
            <MCPToolPopover/>
          </PromptInputTools>
          <PromptInputSubmit
            disabled={!(text.trim() || status) || status === "streaming"}
            status={status}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};
