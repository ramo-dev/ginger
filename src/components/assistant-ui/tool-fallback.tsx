'use client'

import {
  type ToolCallMessagePartComponent,
  type ToolCallMessagePartStatus,
  useScrollLock,
} from '@assistant-ui/react'
import {
  RiErrorWarningLine,
  RiCheckLine,
  RiArrowDownSLine,
  RiHashtag,
  RiTerminalLine,
  RiCloseCircleLine,
  RiLoader4Line,
} from '@remixicon/react'
import { memo, useCallback, useRef, useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const ANIMATION_DURATION = 250

export type ToolFallbackRootProps = Omit<
  React.ComponentProps<typeof Collapsible>,
  'open' | 'onOpenChange'
> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

/**
 * ROOT COMPONENT
 * Uses shadcn tokens for borders, background, and radius.
 * High border-radius, subtle shadow, and clean card layout.
 */
function ToolFallbackRoot({
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  children,
  ...props
}: ToolFallbackRootProps) {
  const collapsibleRef = useRef<HTMLDivElement>(null)
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const lockScroll = useScrollLock(collapsibleRef, ANIMATION_DURATION)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        lockScroll()
      }
      if (!isControlled) {
        setUncontrolledOpen(open)
      }
      controlledOnOpenChange?.(open)
    },
    [lockScroll, isControlled, controlledOnOpenChange],
  )

  return (
    <Collapsible
      ref={collapsibleRef}
      data-slot="tool-fallback-root"
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn(
        'group/tool-fallback-root my-4 w-full overflow-hidden border border-input bg-card  transition-all',
        'rounded-[calc(var(--radius)*1.5)]', // Premium extra-rounded corners
        className,
      )}
      style={
        {
          '--animation-duration': `${ANIMATION_DURATION}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </Collapsible>
  )
}

type ToolStatus = ToolCallMessagePartStatus['type']

const statusIconMap: Record<ToolStatus, React.ElementType> = {
  running: RiLoader4Line,
  complete: RiCheckLine,
  incomplete: RiCloseCircleLine,
  'requires-action': RiErrorWarningLine,
}

/**
 * TRIGGER COMPONENT
 * Minimalist header with status-aware iconography.
 */
function ToolFallbackTrigger({
  toolName,
  status,
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleTrigger> & {
  toolName: string
  status?: ToolCallMessagePartStatus
}) {
  const statusType = status?.type ?? 'complete'
  const isRunning = statusType === 'running'
  const isCancelled =
    status?.type === 'incomplete' && status.reason === 'cancelled'

  const Icon = statusIconMap[statusType]

  return (
    <CollapsibleTrigger
      data-slot="tool-fallback-trigger"
      className={cn(
        'flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors',
        'hover:bg-muted/50 active:bg-muted/80',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full border border-input bg-background shadow-sm',
            isRunning && 'border-primary/30',
          )}
        >
          <Icon
            className={cn(
              'size-3.5',
              isRunning && 'animate-spin text-primary',
              isCancelled && 'text-muted-foreground',
              !isRunning && !isCancelled && 'text-foreground',
            )}
          />
        </div>
        <span
          className={cn(
            'truncate tracking-tight',
            isCancelled && 'text-muted-foreground line-through',
          )}
        >
          {toolName}
        </span>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground/60">
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {isRunning ? 'Running' : 'Details'}
        </span>
        <RiArrowDownSLine
          className={cn(
            'size-4 transition-transform duration-300 ease-out',
            'group-data-[state=open]/tool-fallback-root:rotate-180',
          )}
        />
      </div>
    </CollapsibleTrigger>
  )
}

/**
 * CONTENT COMPONENT
 * Handles the smooth expansion and background styling for the inner drawer.
 */
function ToolFallbackContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="tool-fallback-content"
      className={cn(
        'relative overflow-hidden text-sm outline-none bg-muted/30',
        'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 border-t border-input/50 p-4">
        {children}
      </div>
    </CollapsibleContent>
  )
}

/**
 * ARGS COMPONENT
 * Displays tool parameters in a clean, code-like block.
 */
function ToolFallbackArgs({
  argsText,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  argsText?: string
}) {
  if (!argsText) return null

  return (
    <div
      data-slot="tool-fallback-args"
      className={cn('space-y-1.5', className)}
      {...props}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground/80">
        <RiTerminalLine className="size-3" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Input
        </span>
      </div>
      <pre className="rounded-lg border border-input/40 bg-background/50 p-3 font-mono text-xs leading-relaxed text-foreground/90 overflow-x-auto">
        {argsText}
      </pre>
    </div>
  )
}

/**
 * RESULT COMPONENT
 * Formats the tool output.
 */
function ToolFallbackResult({
  result,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  result?: unknown
}) {
  if (result === undefined) return null

  return (
    <div
      data-slot="tool-fallback-result"
      className={cn('space-y-1.5', className)}
      {...props}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground/80">
        <RiHashtag className="size-3" />
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Output
        </span>
      </div>
      <pre className="rounded-lg border border-input/40 bg-background/50 p-3 font-mono text-xs leading-relaxed text-foreground/90 overflow-x-auto">
        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}

/**
 * ERROR COMPONENT
 * Minimalist error state with soft background colors.
 */
function ToolFallbackError({
  status,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  status?: ToolCallMessagePartStatus
}) {
  if (status?.type !== 'incomplete') return null

  const error = status.error
  const errorText = error
    ? typeof error === 'string'
      ? error
      : JSON.stringify(error)
    : null

  if (!errorText) return null

  const isCancelled = status.reason === 'cancelled'

  return (
    <div
      data-slot="tool-fallback-error"
      className={cn(
        'rounded-lg border p-3',
        isCancelled
          ? 'border-input bg-muted/50'
          : 'border-destructive/20 bg-destructive/5',
        className,
      )}
      {...props}
    >
      <p
        className={cn(
          'text-[11px] font-bold uppercase tracking-wider mb-1',
          isCancelled ? 'text-muted-foreground' : 'text-destructive/80',
        )}
      >
        {isCancelled ? 'Cancelled Reason' : 'Error'}
      </p>
      <p
        className={cn(
          'text-xs leading-normal',
          isCancelled
            ? 'text-muted-foreground'
            : 'text-destructive/90 font-medium',
        )}
      >
        {errorText}
      </p>
    </div>
  )
}

const ToolFallbackImpl: ToolCallMessagePartComponent = ({
  toolName,
  argsText,
  result,
  status,
}) => {
  const isCancelled =
    status?.type === 'incomplete' && status.reason === 'cancelled'

  return (
    <ToolFallbackRoot className={cn(isCancelled && 'opacity-80')}>
      <ToolFallbackTrigger toolName={toolName} status={status} />
      <ToolFallbackContent>
        <ToolFallbackError status={status} />
        <ToolFallbackArgs
          argsText={argsText}
          className={cn(isCancelled && 'opacity-60')}
        />
        {!isCancelled && <ToolFallbackResult result={result} />}
      </ToolFallbackContent>
    </ToolFallbackRoot>
  )
}

const ToolFallback = memo(
  ToolFallbackImpl,
) as unknown as ToolCallMessagePartComponent & {
  Root: typeof ToolFallbackRoot
  Trigger: typeof ToolFallbackTrigger
  Content: typeof ToolFallbackContent
  Args: typeof ToolFallbackArgs
  Result: typeof ToolFallbackResult
  Error: typeof ToolFallbackError
}

ToolFallback.displayName = 'ToolFallback'

ToolFallback.Root = ToolFallbackRoot
ToolFallback.Trigger = ToolFallbackTrigger
ToolFallback.Content = ToolFallbackContent
ToolFallback.Args = ToolFallbackArgs
ToolFallback.Result = ToolFallbackResult
ToolFallback.Error = ToolFallbackError

export {
  ToolFallback,
  ToolFallbackRoot,
  ToolFallbackTrigger,
  ToolFallbackContent,
  ToolFallbackArgs,
  ToolFallbackResult,
  ToolFallbackError,
}
