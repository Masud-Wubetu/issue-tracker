'use client';

import { ThemeProvider } from 'next-themes';
import { Theme } from '@radix-ui/themes';
import { ReactNode } from 'react';

export default function ThemeProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <Theme accentColor="violet">
        {children}
      </Theme>
    </ThemeProvider>
  );
}
