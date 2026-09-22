// app/layout.tsx
// Root Layout — Next.js 16 App Router
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || 'https://www.mcpserver.in'),
  title: {
    default: 'MCPServer.in — India MCP Server Directory',
    template: `%s | MCPServer.in`,
  },
  description:
    'Directory of MCP (Model Context Protocol) servers for India. Find verified MCP servers with evidence-backed claims. Evidence ledger, hosting control plane, and compliance tooling for DPDP and RBI standards.',
  openGraph: {
    locale: 'en-IN',
    type: 'website',
    site: 'mcpserver.in',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mcpserver_in',
    creator: '@febin',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://www.mcpserver.in',
    languages: {
      'en-IN': 'https://www.mcpserver.in/en-IN',
      'hi-IN': 'https://www.mcpserver.in/hi-IN',
    },
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'max-available',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-inter antialiased} bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
