// app/guides/build/[topic]/page.tsx
// Build guides for MCP server development

import { Metadata } from 'next';

const buildGuides: Record<string, { title: string; content: string[] }> = {
  'getting-started': {
    title: 'Getting Started',
    content: [
      'Install the MCP SDK: npm install @modelcontextprotocol/sdk',
      'Create a new TypeScript file for your server',
      'Define your tools using the Server class',
      'Test locally with stdio transport',
      'Register your server with the MCP Registry',
    ],
  },
  'tools': {
    title: 'Tool Development',
    content: [
      'Use Zod schemas for input validation',
      'Mark tools as readonly when they don\'t modify state',
      'Handle errors gracefully with proper error types',
      'Test edge cases and invalid inputs',
    ],
  },
  'resources': {
    title: 'Resource Implementation',
    content: [
      'Define resource URIs with proper schemas',
      'Handle both templates and static resources',
      'Implement proper MIME type handling',
    ],
  },
  'prompts': {
    title: 'Prompt Engineering',
    content: [
      'Define reusable prompt templates',
      'Use dynamic arguments for customization',
      'Document prompts properly for AI models',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(buildGuides).map((topic) => ({ topic }));
}

interface PageProps {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { topic } = await params;
  const guide = buildGuides[topic];
  if (!guide) return { title: 'Not Found | MCPServer.in' };
  return { title: `${guide.title} — Build Guide | MCPServer.in` };
}

export default async function BuildGuidePage({ params }: PageProps) {
  const { topic } = await params;
  const guide = buildGuides[topic];

  if (!guide) {
    return (
      <div className="container mx-auto py-16">
        <h1>Guide Not Found</h1>
      </div>
    );
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
