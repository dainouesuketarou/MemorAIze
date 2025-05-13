'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { SyncSessionToRedux } from './SyncSessionToRedux';
import { store } from '@/store';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <ReduxProvider store={store}>
          {children}
        </ReduxProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}