import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { Toaster } from '@/components/ui/toaster';
import '../styles/globals.css';

/**
 * The root App component.
 * This component wraps every page in your application, allowing you to add global providers.
 *
 * @param {AppProps} { Component, pageProps: { session, ...pageProps } }
 * @returns {JSX.Element} The wrapped application component.
 */
export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    // The SessionProvider makes authentication state available throughout the app.
    <SessionProvider session={session}>
      {/* The ThemeProvider handles light/dark mode switching. */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {/* The Component prop is the active page being rendered. */}
        <Component {...pageProps} />
        {/* The Toaster component renders notifications (toasts). */}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
}
