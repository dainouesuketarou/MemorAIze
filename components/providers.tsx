'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { store } from '@/store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </ReduxProvider>
    </SessionProvider>
  );
}