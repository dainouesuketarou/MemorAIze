'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { store } from '@/src/lib/store/store';
import { SyncSessionToRedux } from './sync-session-to-redux';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <SyncSessionToRedux>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            themes={['light', 'dark', 'blue', 'green']}
          >
            {children}
          </ThemeProvider>
        </SyncSessionToRedux>
      </ReduxProvider>
    </SessionProvider>
  );
}
