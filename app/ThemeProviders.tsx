'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const ThemeProvider = dynamic(() => import('next-themes').then(mod => mod.ThemeProvider), {
  ssr: true,
});

export default function ThemeProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  );
}
