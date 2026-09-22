// app/not-found.tsx
// 404 page

import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found | MCPServer.in',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/servers"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80"
          >
            <Search className="h-4 w-4" />
            Browse Servers
          </Link>
        </div>
      </div>
    </div>
  );
}
