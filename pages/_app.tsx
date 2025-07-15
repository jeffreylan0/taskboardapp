import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
}
