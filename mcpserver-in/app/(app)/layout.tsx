// app/(app)/layout.tsx
// Authenticated control plane layout

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  // In production, verify the token
  if (!token) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl">MCPServer.in</Link>
          <div className="flex items-center gap-4">
            <Link href="/(app)/dashboard" className="text-sm hover:text-primary">Dashboard</Link>
            <Link href="/(app)/servers" className="text-sm hover:text-primary">My Servers</Link>
            <Link href="/(app)/credentials" className="text-sm hover:text-primary">Credentials</Link>
            <Link href="/(app)/audit" className="text-sm hover:text-primary">Audit</Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
