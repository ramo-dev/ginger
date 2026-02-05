import {
  ActionBarPrimitive,
  AssistantIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from '@assistant-ui/react'
import { RiBarChartLine, RiSendPlaneLine } from '@remixicon/react'
import {
  RiArrowDownSLine,
  RiCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFileCopyLine,
  RiDownloadLine,
  RiTerminalLine,
  RiSquareLine,
  RiRefreshLine,
  RiPencilLine,
} from '@remixicon/react'
import type { FC, PropsWithChildren } from 'react'
import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from '@/components/assistant-ui/attachment'
import { MarkdownText } from '@/components/assistant-ui/markdown-text'
import { Reasoning, ReasoningGroup } from '@/components/assistant-ui/reasoning'
import { ToolFallback } from '@/components/assistant-ui/tool-fallback'
import { TooltipIconButton } from '@/components/assistant-ui/tooltip-icon-button'
import { Button } from '@/components/ui/button'
import { SUGGESTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { MCPToolPopover } from '@/components/mcp-ui'
import { Sources } from './sources'
import { Skeleton } from '../ui/skeleton'
import { authClient } from '@/lib/auth/client'
import { ModelPopover } from '../chat/model-popover'

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root flex-1 aui-thread-root @container max-h-[calc(100vh-4rem)] flex h-full flex-col bg-background"
      style={{
        ['--thread-max-width' as string]: '50rem',
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        className="aui-thread-viewport relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth px-4 pt-4"
      >
        <AssistantIf condition={({ thread }) => thread.isEmpty}>
          <ThreadWelcome />
        </AssistantIf>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            EditComposer,
            AssistantMessage,
          }}
        />

        <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mx-auto mt-auto flex w-full max-w-(--thread-max-width) flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
          <ThreadScrollToBottom />
          <Composer />
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  )
}

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible dark:bg-background dark:hover:bg-accent"
      >
        <RiArrowDownSLine />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  )
}

const ThreadWelcome: FC = () => {
  const { data: session, isPending } = authClient.useSession()
  const firstName = session?.user?.name?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mx-auto flex w-full max-w-(--thread-max-width) grow flex-col">
      <div className="flex w-full grow flex-col justify-center py-6">
        {isPending ? (
          <Skeleton className="h-16 max-w-64 w-full" />
        ) : (
          <div className="space-y-2">
            <h1 className="animate-in fade-in slide-in-from-bottom-3 duration-700 text-4xl font-medium tracking-tight text-foreground">
              {greeting}
              {session && (
                <span className="text-muted-foreground">
                  {', '}
                  {firstName}.
                </span>
              )}
            </h1>
            <p className="animate-in fade-in slide-in-from-bottom-4 delay-150 duration-700 text-base text-muted-foreground/80">
              What's on your mind today?
            </p>
          </div>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-5 delay-300 duration-1000">
        <ThreadSuggestions />
      </div>
    </div>
  )
}

const ThreadSuggestions: FC = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-3 pb-6 sm:grid-cols-2">
      {SUGGESTIONS.map((suggestion, index) => (
        <div
          key={suggestion.prompt}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDelay: `${200 + index * 100}ms` }}
        >
          <ThreadPrimitive.Suggestion prompt={suggestion.prompt} send asChild>
            <Button
              variant="outline"
              className="group relative flex h-auto w-full flex-col items-start justify-start gap-3 rounded-xl border-border/50 bg-background p-4 text-left transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
              aria-label={suggestion.prompt}
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
                <p className="font-semibold leading-none tracking-tight">
                  {suggestion.title}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {suggestion.label}
                </p>
              </div>
            </Button>
          </ThreadPrimitive.Suggestion>
        </div>
      ))}
    </div>
  )
}

const Composer: FC = () => {
  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      <ComposerPrimitive.AttachmentDropzone className="aui-composer-attachment-dropzone flex w-full flex-col rounded-2xl border border-input bg-background px-1 pt-2 outline-none transition-shadow has-[textarea:focus-visible]:border-ring has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-ring/20 data-[dragging=true]:border-ring data-[dragging=true]:border-dashed data-[dragging=true]:bg-accent/50">
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Send a message..."
          className="aui-composer-input mb-1 max-h-32 min-h-14 w-full resize-none bg-transparent px-4 pt-2 pb-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  )
}

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative mx-2 mb-2 flex items-center justify-between">
      <div className="flex gap-1 items-center">
        <ComposerAddAttachment />
        <MCPToolPopover />
        <ModelPopover />
      </div>

      <AssistantIf condition={({ thread }) => !thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send message"
            side="bottom"
            type="submit"
            variant="default"
            size="icon"
            className="aui-composer-send size-8 rounded-full"
            aria-label="Send message"
          >
            <RiSendPlaneLine className="aui-composer-send-icon size-4" />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </AssistantIf>

      <AssistantIf condition={({ thread }) => thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <Button
            type="button"
            variant="default"
            size="icon"
            className="aui-composer-cancel size-8 rounded-full"
            aria-label="Stop generating"
          >
            <RiSquareLine className="aui-composer-cancel-icon size-3 fill-current" />
          </Button>
        </ComposerPrimitive.Cancel>
      </AssistantIf>
    </div>
  )
}

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  )
}

const ToolGroup: FC<
  PropsWithChildren<{ startIndex: number; endIndex: number }>
> = ({ startIndex, endIndex, children }) => {
  const toolCount = endIndex - startIndex + 1

  return (
    <div className="my-4 overflow-hidden rounded-xl border shadow-sm transition-all hover:border-primary/30 bg-background">
      <details className="group">
        <summary className="flex cursor-pointer items-center justify-between p-3 select-none">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <RiTerminalLine size={16} />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                AI Operation
              </span>
              <p className="text-xs text-slate-500">
                {toolCount} {toolCount === 1 ? 'task' : 'tasks'} executed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RiArrowRightSLine
              size={18}
              className="text-slate-400 transition-transform duration-200 group-open:rotate-90"
            />
          </div>
        </summary>

        <div className="border-t p-4">
          <div className="space-y-3 border-l border-primary/20 pl-5">
            {children}
          </div>
        </div>
      </details>
    </div>
  )
}

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-assistant-message-root fade-in slide-in-from-bottom-1 relative mx-auto w-full max-w-(--thread-max-width) animate-in py-3 duration-150"
      data-role="assistant"
    >
      <div className="aui-assistant-message-content wrap-break-word px-2 text-foreground leading-relaxed">
        <MessagePrimitive.Parts
          components={{
            Text: MarkdownText,
            tools: { Fallback: ToolFallback },
            Reasoning: Reasoning,
            ReasoningGroup: ReasoningGroup,
            Source: Sources,
          }}
        />
        <MessageError />
      </div>

      <div className="aui-assistant-message-footer mt-1 ml-2 flex">
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  )
}

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <AssistantIf condition={({ message }) => message.isCopied}>
            <RiCheckLine />
          </AssistantIf>
          <AssistantIf condition={({ message }) => !message.isCopied}>
            <RiFileCopyLine />
          </AssistantIf>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.ExportMarkdown asChild>
        <TooltipIconButton tooltip="Export as Markdown">
          <RiDownloadLine />
        </TooltipIconButton>
      </ActionBarPrimitive.ExportMarkdown>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RiRefreshLine />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  )
}

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      className="aui-user-message-root fade-in slide-in-from-bottom-1 mx-auto grid w-full max-w-(--thread-max-width) animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 py-3 duration-150 [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content wrap-break-word rounded-2xl bg-muted px-4 py-2.5 text-foreground">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker className="aui-user-branch-picker col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  )
}

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <RiPencilLine />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  )
}

const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root className="aui-edit-composer-wrapper mx-auto flex w-full max-w-(--thread-max-width) flex-col px-2 py-3">
      <ComposerPrimitive.Root className="aui-edit-composer-root ml-auto flex w-full max-w-[85%] flex-col rounded-2xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-foreground text-sm outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  )
}

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        'aui-branch-picker-root mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs',
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <RiArrowLeftSLine />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <RiArrowRightSLine />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}
