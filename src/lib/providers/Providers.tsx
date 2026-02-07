import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { StoreInitializer } from '@/components/StoreInitializer'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: theme === 'dark' ? '#333' : '#fff',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
