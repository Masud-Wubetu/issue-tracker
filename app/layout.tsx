import "@radix-ui/themes/styles.css"
import './theme-config.css'
import './globals.css'
import type { Metadata } from 'next'
import { Container, Theme } from "@radix-ui/themes";
import { Inter } from 'next/font/google'
import NavBar from './NavBar'

const inter = Inter({ 
  subsets: ['latin'],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    template: '%s | IssueTracker',
    default: 'IssueTracker',
  },
  description: 'A modern, full-stack issue tracker to streamline your project management.',
}

import AuthProvider from "./auth/Provider";
import QueryClientProvider from "./QueryClientProvider";
import ThemeProviders from "./ThemeProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <QueryClientProvider>
          <AuthProvider>
            <ThemeProviders>
              <NavBar />
              <main className='p-5'>
                <Container>{children}</Container>
              </main>
            </ThemeProviders>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}


