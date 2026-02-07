import { Shimmer } from '@/components/ai-elements/shimmer'
import { useEffect, useState } from 'react'

const thinkingMessages = [
  { text: 'Pondering...', duration: 4000 },
  { text: 'Thinking...', duration: 5000 },
  { text: 'Contemplating...', duration: 3000 },
  { text: 'Consulting the hivemind...', duration: 2500 },
  { text: 'Crunching numbers...', duration: 2000 },
  { text: 'Connecting the dots...', duration: 4000 },
  { text: 'Having an epiphany...', duration: 3500 },
  { text: 'Brewing thoughts...', duration: 2800 },
  { text: 'Summoning wisdom...', duration: 3000 },
  { text: 'Processing brilliance...', duration: 2500 },
]

export default function ModelStreamingLoader() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const currentMessage = thinkingMessages[messageIndex]
    const timer = setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % thinkingMessages.length)
    }, currentMessage.duration)

    return () => clearTimeout(timer)
  }, [messageIndex])

  return (
    <div className="flex gap-2 items-center text-muted-foreground">
      <InfiniteLoader />
      <Shimmer className="text-sm">
        {thinkingMessages[messageIndex].text}
      </Shimmer>
    </div>
  )
}

export const InfiniteLoader = ({ size = 24, ...props }) => (
  <svg
    height={size}
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 100 100"
    width={size}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Loading...</title>
    <path
      d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z"
      fill="none"
      stroke="currentColor"
      strokeDasharray="205.271142578125 51.317785644531256"
      strokeLinecap="round"
      strokeWidth="10"
      style={{
        transform: 'scale(0.8)',
        transformOrigin: '50px 50px',
      }}
    >
      <animate
        attributeName="stroke-dashoffset"
        dur="2s"
        keyTimes="0;1"
        repeatCount="indefinite"
        values="0;256.58892822265625"
      />
    </path>
  </svg>
)
