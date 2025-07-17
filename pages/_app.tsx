import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { Toaster } from 'sonner'; // Import from sonner
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      {/* The ThemeProvider handles light/dark mode switching. */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
        {/* The Toaster from sonner uses the page's theme automatically */}
        <Toaster richColors />
      </ThemeProvider>
    </SessionProvider>
  );
}
