// app/guides/operations/[topic]/page.tsx
// Operations guides for running MCP servers in production

import { Metadata } from 'next';

const opsGuides: Record<string, { title: string; content: string[] }> = {
  'monitoring': {
    title: 'Monitoring & Observability',
    content: [
      'Use structured logging with correlation IDs',
      'Set up metrics for tool call latency and error rates',
      'Monitor MCP connection lifecycle events',
      'Alert on anomalous tool call patterns',
    ],
  },
  'scaling': {
    title: 'Scaling & Performance',
    content: [
      'Use Streamable HTTP transport for horizontal scaling',
      'Implement connection pooling for downstream services',
      'Cache expensive tool results with appropriate TTLs',
    ],
  },
  'updates': {
    title: 'Updating & Maintenance',
    content: [
      'Use version pinning to prevent breaking changes',
      'Test updates in staging before production deployment',
      'Monitor for deprecated tool warnings',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(opsGuides).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const guide = opsGuides[topic];
  if (!guide) return { title: 'Not Found | MCPServer.in' };
  return { title: `${guide.title} — Operations Guide | MCPServer.in` };
}

export default async function OpsGuidePage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const guide = opsGuides[topic];

  if (!guide) {
    return <div className="container mx-auto py-16"><h1>Guide Not Found</h1></div>;
  }

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-4xl font-bold mb-6">{guide.title}</h1>
      <ol className="space-y-3">
        {guide.content.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="font-bold">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
