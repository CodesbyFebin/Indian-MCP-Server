// app/(marketing)/methodology/page.tsx
// Methodology page

import { Metadata } from 'next';
import { CheckCircle, Search, Shield, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Methodology | MCPServer.in',
  description:
    'How we verify MCP servers. Our evidence-backed claims system and verification methodology.',
};

export default function MethodologyPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Verification Methodology</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Every claimed capability on MCPServer.in is backed by evidence. Here's
          how we verify servers.
        </p>
      </div>

      <div className="space-y-12">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Discovery</h2>
            <p className="text-muted-foreground">
              We discover MCP servers through registry queries, package listings,
              README analysis, and repository commits. Each discovery source is
              recorded as evidence.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Verification</h2>
            <p className="text-muted-foreground">
              We verify claims using automated testing, spec compliance checks,
              and manual review. All verification is recorded with timestamps and
              proof hashes for immutability.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Evidence</h2>
            <p className="text-muted-foreground">
              Every claim is backed by evidence artifacts stored in our
              append-only ledger. The ledger uses SHA-256 proof hashes and is
              tamper-evident.
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Publication</h2>
            <p className="text-muted-foreground">
              Verified servers are published with full evidence transparency.
              Consumers can verify claims themselves using our public API and
              evidence ledger.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 bg-card rounded-lg p-8 border">
        <h2 className="text-2xl font-bold mb-4">Evidence Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Automated Tests</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Tool execution results</li>
              <li>• Transport connectivity</li>
              <li>• Schema validation</li>
              <li>• Error handling</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Manual Review</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Security audit</li>
              <li>• Compliance check</li>
              <li>• Performance evaluation</li>
              <li>• Code quality assessment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
