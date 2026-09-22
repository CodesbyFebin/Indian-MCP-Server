// app/guides/security/[topic]/page.tsx
// Security guides for MCP server deployment

import { Metadata } from 'next';

const securityGuides: Record<string, { title: string; content: string[] }> = {
  'authentication': {
    title: 'Authentication & Authorization',
    content: [
      'Use bearer tokens (JWT) for MCP authentication',
      'Implement RFC 9728 protected resource metadata',
      'Scope tokens to minimum required permissions',
      'Rotate tokens frequently and use short-lived tokens',
    ],
  },
  'tls': {
    title: 'TLS & Encryption',
    content: [
      'Enforce TLS 1.3 for all HTTP connections',
      'Use valid certificates from trusted CAs',
      'Disable SSL/TLS renegotiation for Streamable HTTP',
    ],
  },
  'pii': {
    title: 'PII Handling & DPDP Compliance',
    content: [
      'Automatically redact PII from logs and error messages',
      'Implement data minimization — collect only what you need',
      'Provide consent management for data subjects',
      'Maintain audit trails with redacted entries',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(securityGuides).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const guide = securityGuides[topic];
  if (!guide) return { title: 'Not Found | MCPServer.in' };
  return { title: `${guide.title} — Security Guide | MCPServer.in` };
}

export default async function SecurityGuidePage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const guide = securityGuides[topic];

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
