// app/(app)/playground/page.tsx
// Interactive MCP playground for testing tools

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/verify-token';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { Send, Copy, Check } from 'lucide-react';

export default async function PlaygroundPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  const authContext = token ? await verifyToken(token.value) : null;

  if (!authContext) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">MCP Playground</h1>
        <p className="text-muted-foreground">
          Test MCP tools in real-time
        </p>
      </div>

      <PlaygroundInterface token={token!.value} />
    </div>
  );
}

function PlaygroundInterface({ token }: { token: string }) {
  const [request, setRequest] = useState(
    JSON.stringify(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      },
      null,
      2,
    ),
  );
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSend = async () => {
    if (!request.trim()) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: request,
      });

      const text = await res.text();
      let formatted = text;
      try {
        const json = JSON.parse(text);
        formatted = JSON.stringify(json, null, 2);
      } catch {
        // Keep raw text if not JSON
      }
      setResponse(formatted);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableTools = [
    {
      name: 'search_mcp_servers',
      description: 'Search MCP servers by query',
      template: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'search_mcp_servers',
            arguments: { query: 'github', verifiedOnly: true },
          },
        },
        null,
        2,
      ),
    },
    {
      name: 'get_server_evidence',
      description: 'Get evidence ledger for a server',
      template: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'get_server_evidence',
            arguments: { slug: 'io.modelcontextprotocol.server' },
          },
        },
        null,
        2,
      ),
    },
    {
      name: 'tools/list',
      description: 'List all available tools',
      template: JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/list',
          params: {},
        },
        null,
        2,
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Request Editor */}
      <div className="lg:col-span-1">
        <h2 className="text-lg font-semibold mb-3">Request</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1">Quick Templates</label>
            <div className="space-y-2">
              {availableTools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => setRequest(tool.template)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {tool.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="w-full h-64 font-mono text-sm p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Response Viewer */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Response</h2>
          {response && (
            <button
              onClick={handleCopy}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label={copied ? 'Copied!' : 'Copy response'}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
        </div>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          readOnly={loading}
          className="w-full h-64 font-mono text-sm p-3 border rounded-lg bg-muted/25 resize-y focus:outline-none"
          spellCheck={false}
          placeholder="// Send a request to see the response"
        />

        <button
          onClick={handleSend}
          disabled={loading || !request.trim()}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Request'}
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
