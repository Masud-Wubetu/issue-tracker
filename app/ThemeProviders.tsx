'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { Theme } from '@radix-ui/themes';
import { ReactNode, useEffect, useState } from 'react';

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Theme 
      accentColor="violet" 
      appearance={mounted ? (resolvedTheme as 'light' | 'dark') : 'light'}
      panelBackground="translucent"
    >
      {children}
    </Theme>
  );
}

export default function ThemeProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <ThemeWrapper>{children}</ThemeWrapper>
    </ThemeProvider>
  );
}
