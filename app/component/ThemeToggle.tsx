'use client';

import { useTheme } from 'next-themes';
import { Button } from '@radix-ui/themes';
import { SunIcon, MoonIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Button variant="ghost" size="2" disabled />;

  return (
    <Button
      variant="ghost"
      color="gray"
      size="2"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="cursor-pointer transition-all hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <SunIcon width="18" height="18" /> : <MoonIcon width="18" height="18" />}
    </Button>
  );
}
