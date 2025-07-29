import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
}
