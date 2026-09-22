// app/(app)/credentials/page.tsx
// Credentials management page

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { redirect } from 'next/navigation';
import { Key, Copy, RefreshCw, Trash2 } from 'lucide-react';

export default async function CredentialsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const authContext = token ? await verifyToken(token.value) : null;

  if (!authContext) {
    redirect('/api/auth/signin');
  }

  // TODO: In production, fetch actual API tokens from database
  const mockTokens = [
    { id: '1', name: 'Claude Desktop', prefix: 'tkp_', scopes: ['mcp:read'], createdAt: new Date('2026-01-15') },
    { id: '2', name: 'VSCode Extension', prefix: 'tkp_', scopes: ['mcp:read', 'mcp:execute'], createdAt: new Date('2026-02-20') },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">API Credentials</h1>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
          <Key className="h-4 w-4" />
          New Token
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/25">
              <th className="text-left p-4">Token Name</th>
              <th className="text-left p-4">Scopes</th>
              <th className="text-left p-4">Created</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTokens.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No API tokens yet.
                </td>
              </tr>
            ) : (
              mockTokens.map((tokenItem) => (
                <tr key={tokenItem.id} className="border-t">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      {tokenItem.name}
                    </div>
                  </td>
                  <td className="p-4 text-sm">{tokenItem.scopes.join(', ')}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {tokenItem.createdAt.toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Copy token"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Regenerate token"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-red-500 hover:text-red-700"
                        aria-label="Delete token"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Security Recommendations</h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5" />
            <span>Store tokens securely — never commit to version control</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5" />
            <span>Rotate tokens periodically — minimum every 90 days</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5" />
            <span>Use least-privilege scopes — only grant what the client needs</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5" />
            <span>Restrict by IP if the client uses a static address</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
