// app/(app)/audit/page.tsx
// Audit log viewer — authenticated control plane

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Shield, Eye, Calendar } from 'lucide-react';

export default async function AuditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const authContext = token ? await verifyToken(token.value) : null;

  if (!authContext) {
    redirect('/api/auth/signin');
  }

  const auditEntries = await db.query.auditLog.findMany({
    orderBy: (log, { desc }) => desc(log.createdAt),
    limit: 50,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">
            Monitor all MCP tool calls and access events
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/25">
              <th className="text-left p-4">Timestamp</th>
              <th className="text-left p-4">Tool</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Latency</th>
            </tr>
          </thead>
          <tbody>
            {auditEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No audit events recorded yet.
                </td>
              </tr>
            ) : (
              auditEntries.map((entry) => (
                <tr key={entry.id} className="border-t">
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {entry.createdAt.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{entry.toolName}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        entry.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : entry.status === 'denied'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{entry.userId}</td>
                  <td className="p-4 text-sm">{entry.latencyMs}ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
