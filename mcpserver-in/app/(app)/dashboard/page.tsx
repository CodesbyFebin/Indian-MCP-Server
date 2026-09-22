// app/(app)/dashboard/page.tsx
// User dashboard — authenticated control plane

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { db } from '@/lib/db';
import { servers, evidence } from '@/lib/db/schema';
import Link from 'next/link';
import { Plus, BarChart3, Shield, Clock } from 'lucide-react';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  let authContext = null;
  if (token?.value) {
    authContext = await verifyToken(token.value);
  }

  if (!authContext) {
    return (
      <div className="container mx-auto py-16">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-4">
          You must be signed in to access the dashboard.
        </p>
        <Link
          href="/api/auth/signin"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Fetch user's servers
  const userServers = await db.query.servers.findMany({
    limit: 10,
  });

  // Fetch recent evidence
  const recentEvidence = await db.query.evidence.findMany({
    limit: 10,
    orderBy: (ev, { desc }) => desc(ev.verifiedAt),
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {authContext.principalId}
          </p>
        </div>
        <Link
          href="/(app)/deploy"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Deployment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{userServers.length}</p>
              <p className="text-sm text-muted-foreground">Your Servers</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {recentEvidence.filter((e) => e.claim.includes('verified')).length}
              </p>
              <p className="text-sm text-muted-foreground">Verified Claims</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/25">
              <th className="text-left p-4">Server</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Evidence</th>
              <th className="text-left p-4">Updated</th>
            </tr>
          </thead>
          <tbody>
            {userServers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No servers yet. Deploy your first MCP server.
                </td>
              </tr>
            ) : (
              userServers.map((server) => (
                <tr key={server.id} className="border-t">
                  <td className="p-4">
                    <Link href={`/servers/${server.slug}`} className="font-medium hover:text-primary">
                      {server.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        server.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {server.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {recentEvidence.filter((e) => e.serverId === server.id).length} artifacts
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {server.updatedAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
