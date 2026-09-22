// app/(app)/servers/page.tsx
// List the authenticated user's servers

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Plus, Globe, Github } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MyServersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const authContext = token ? await verifyToken(token.value) : null;

  if (!authContext) {
    redirect('/api/auth/signin');
  }

  const userServers = await db.query.servers.findMany({
    limit: 50,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Servers</h1>
        <Link
          href="/(app)/deploy"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Add Server
        </Link>
      </div>

      {userServers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No servers registered yet.</p>
          <Link
            href="/(app)/deploy"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Deploy Your First Server
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/25">
                <th className="text-left p-4">Server</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Evidence</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userServers.map((server) => (
                <tr key={server.id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted/25 rounded flex-shrink-0 flex items-center justify-center">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <Link
                          href={`/servers/${server.slug}`}
                          className="font-medium hover:text-primary"
                        >
                          {server.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {server.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        server.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : server.status === 'under_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {server.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {server.verified ? 'Verified' : 'Not yet verified'}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/servers/${server.slug}/evidence`}
                      className="text-sm text-primary hover:underline"
                    >
                      View Evidence
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
