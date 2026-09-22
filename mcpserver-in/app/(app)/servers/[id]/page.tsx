// app/(app)/servers/[id]/page.tsx
// Individual server management page (authenticated)

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Server, ExternalLink, Copy, RefreshCw } from 'lucide-react';

export default async function ManageServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const authContext = token ? await verifyToken(token.value) : null;

  if (!authContext) {
    redirect('/api/auth/signin');
  }

  const { id } = await params;
  const server = await db.query.servers.findFirst({
    where: { id },
  });

  if (!server) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{server.name}</h1>
          <p className="text-muted-foreground">Manage server configuration</p>
        </div>
      </div>

      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Server ID</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm bg-muted/20 px-2 py-1 rounded">{server.id}</code>
              <button
                onClick={() => navigator.clipboard.writeText(server.id)}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Copy server ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Slug</label>
            <p className="text-sm text-muted-foreground mt-1">{server.slug}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <p className="text-sm mt-1">
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  server.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {server.status}
              </span>
            </span>
            </p>
          </div>

          {server.repoUrl && (
            <div>
              <label className="text-sm font-medium">Repository</label>
              <div className="mt-1">
                <a
                  href={server.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {server.repoUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50">
        Delete Server
      </button>
    </div>
  );
}
