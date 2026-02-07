import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '@/components/ai-elements/attachments'
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
} from '@/components/ai-elements/prompt-input'
import { RiBrainAi3Line, RiPauseCircleFill } from '@remixicon/react'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import { MCPToolPopover } from '@/components/mcp-ui'
import { ModelPopover } from '../model-popover'
import { useModelStore } from '@/lib/store/model-store'
import { TooltipIconButton } from '@/components/tooltip-icon-button'

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments()

  if (attachments.files.length === 0) {
    return null
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
  )
}

interface ChatInputProps {
  text: string
  setText: (text: string) => void
  useWebSearch?: boolean
  setUseWebSearch?: (useWebSearch: boolean) => void
  useMicrophone?: boolean
  setUseMicrophone?: (useMicrophone: boolean) => void
  status: UseChatHelpers<UIMessage>['status']
  onSubmit: (message: PromptInputMessage) => void
  stop: UseChatHelpers<UIMessage>['stop']
  resume: UseChatHelpers<UIMessage>['resumeStream']
}

export const ChatInput = ({
  text,
  setText,
  status,
  onSubmit,
  stop,
  resume,
}: ChatInputProps) => {
  const { reasoning, setReasoning } = useModelStore()
  return (
    <div className="w-full pb-4 sm:px-0 px-2">
      <PromptInput
        globalDrop
        multiple
        onSubmit={onSubmit}
        className="rounded-2xl"
      >
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
          <PromptInputTools className="w-fit">
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger className="dark:border border-muted/80 rounded-xl" />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <TooltipIconButton
              tooltip="Reasoning"
              side="top"
              variant="ghost"
              size="icon"
              className="mx-1"
            >
              <PromptInputButton
                variant={reasoning ? 'default' : 'ghost'}
                className="dark:border border-muted/80 rounded-xl"
                onClick={() => setReasoning(!reasoning)}
              >
                <RiBrainAi3Line />
              </PromptInputButton>
            </TooltipIconButton>
            <MCPToolPopover />
            <ModelPopover />
          </PromptInputTools>
          <div className="ms-auto flex items-center">
            <PromptInputSubmit
              className="rounded-full"
              disabled={!(text.trim() || status) || status === 'streaming'}
              status={status}
            />
            {status === 'streaming' && (
              <TooltipIconButton
                tooltip={status === 'streaming' ? 'Stop' : 'Resume'}
                side="top"
                variant="ghost"
                size="icon"
                className="mx-1.5"
              >
                <PromptInputButton
                  variant={status === 'streaming' ? 'default' : 'ghost'}
                  className="dark:border border-muted/80 rounded-xl"
                  onClick={() => (status === 'streaming' ? stop() : resume())}
                >
                  <RiPauseCircleFill />
                </PromptInputButton>
              </TooltipIconButton>
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
