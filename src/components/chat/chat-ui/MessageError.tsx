import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UIMessage, UseChatHelpers } from '@ai-sdk/react'
import { RiErrorWarningLine } from '@remixicon/react'

export function MessageError({
  error,
  regenerate,
}: {
  error?: string
  regenerate: UseChatHelpers<UIMessage>['regenerate']
}) {
  return (
    <Card className="w-full flex-col p-4 max-w-sm">
      <div className="flex gap-2 text-destructive">
        <RiErrorWarningLine />
        <p>{error}</p>
      </div>
      <Button
        variant="destructive"
        className="cursor-pointer"
        onClick={() => regenerate()}
      >
        Retry
      </Button>
    </Card>
  )
}
