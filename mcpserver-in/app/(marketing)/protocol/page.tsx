// app/(marketing)/protocol/page.tsx
// Protocol specification page

import { Metadata } from 'next';
import { Code, Globe, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Protocol | MCPServer.in',
  description:
    'Technical specification of the MCP protocol as implemented for the India region. Learn about transport, authentication, and compliance.',
};

export default function ProtocolPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Model Context Protocol</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          The technical specification of the MCP protocol, adapted for the India
          region with DPDP and RBI cybersecurity compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Transport</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            Supports both stdio and Streamable HTTP transports. In the India
            region, we require TLS 1.3 for all HTTP connections.
          </p>
          <code className="text-sm bg-muted/20 px-3 py-1 rounded">
            stdio + streamable_http
          </code>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Authentication</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            Uses OAuth 2.0 with PKCE flow. JWT bearer tokens with ES256 signing.
            Tokens are validated against RFC 9728.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Tools</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            Tools are defined using Zod schemas. Each tool declares its input
            schema, output schema, and security annotations.
          </p>
        </div>

        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Regions</h2>
          </div>
          <p className="text-muted-foreground mb-3">
            Servers are tagged with their deployment region. The India region
            tag (asia-south1) indicates data residency guarantees.
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h2>Protocol Version</h2>
        <p>
          <strong>2026-07-28 (Latest)</strong> — This version deprecates session
          management in favor of stateless request/response. The
          <code>server/discover</code> method is used for capability discovery,
          and <code>_meta</code> envelopes carry provider-specific annotations.
        </p>

        <h2>Request/Response Format</h2>
        <pre className="bg-muted/20 p-6 rounded-lg overflow-x-auto">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search_servers",
    "arguments": {
      "query": "github"
    }
  }
}`}
        </pre>

        <h2>Available Methods</h2>
        <ul>
          <li><code>initialize</code> — Protocol negotiation</li>
          <li><code>initialized</code> — Confirmation notification</li>
          <li><code>tools/list</code> — List available tools</li>
          <li><code>tools/call</code> — Execute a tool</li>
          <li><code>resources/list</code> — List available resources</li>
          <li><code>prompts/list</code> — List available prompts</li>
          <li><code>server/discover</code> — 2026-07-28 discovery</li>
        </ul>
      </div>
    </div>
  );
}
