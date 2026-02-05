import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { StoreInitializer } from '@/components/StoreInitializer'
import { ChatRuntimeProvider } from './ChatRuntimeProvider'
import { DevToolsModal } from '@assistant-ui/react-devtools'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer />
      <ChatRuntimeProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
          <DevToolsModal />
        </ThemeProvider>
      </ChatRuntimeProvider>
    </QueryClientProvider>
  )
}
