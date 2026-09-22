// app/(marketing)/glossary/page.tsx
// Glossary of MCP terms

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glossary | MCPServer.in',
  description:
    'Glossary of MCP (Model Context Protocol) and related terms.',
};

const glossary = [
  {
    term: 'MCP',
    definition:
      'Model Context Protocol — an open protocol for connecting LLMs to external data sources and tools. Provides a standardized way for AI assistants to interact with servers.',
  },
  {
    term: 'Server',
    definition:
      'An MCP server is an implementation of the protocol that exposes tools, resources, or prompts. Servers can run locally (stdio) or be hosted (HTTP/SSE).',
  },
  {
    term: 'Tool',
    definition:
      'A callable function exposed by an MCP server. Tools can perform any action: query APIs, run code, modify files, etc.',
  },
  {
    term: 'Resource',
    definition:
      'A read-only data source exposed by an MCP server. Resources can be files, database tables, API endpoints, or any URI-addressable data.',
  },
  {
    term: 'Prompt',
    definition:
      'A reusable prompt template provided by an MCP server. Prompts give structured instructions for common tasks.',
  },
  {
    term: 'Transport',
    definition:
      'The communication mechanism between client and server. MCP supports stdio, Streamable HTTP, and the newer webhook transport.',
  },
  {
    term: 'Evidence',
    definition:
      'A verifiable artifact that supports a claim about a server\'s capabilities. Evidence includes proof hashes, verification timestamps, and source URLs.',
  },
  {
    term: 'Verification',
    definition:
      'The process of confirming a server\'s claimed capabilities through automated testing, manual review, or spec compliance checks.',
  },
  {
    term: 'DPDP',
    definition:
      'Digital Personal Data Protection Act (India, 2023). Governs how personal data is collected, processed, and protected.',
  },
  {
    term: 'RBI Cyber Framework',
    definition:
      'Reserve Bank of India cybersecurity framework. Requires financial institutions to implement specific controls (MFA, audit logging, incident response).',
  },
];

export default function GlossaryPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Glossary</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Terms used across MCPServer.in and the MCP ecosystem.
        </p>
      </div>

      <div className="space-y-8">
        {glossary.map((item) => (
          <div key={item.term} id={item.term.toLowerCase().replace(/\s+/g, '-')}>
            <h2 className="text-xl font-semibold mb-1">{item.term}</h2>
            <p className="text-muted-foreground">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
