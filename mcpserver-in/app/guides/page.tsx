// app/guides/page.tsx
// Guides listing page

import { Metadata } from 'next';
import Link from 'next/link';
import { Book, Code, Shield, Terminal, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guides | MCPServer.in',
  description: 'Step-by-step guides for MCP clients, servers, and deployment.',
};

const categories = [
  {
    name: 'Client Setup',
    description: 'Configure MCP on Claude Desktop, Cursor, VS Code, and more.',
    icon: <Settings className="h-6 w-6" />,
    href: '/guides/clients',
  },
  {
    name: 'Build Your Server',
    description: 'Create and publish your own MCP server.',
    icon: <Code className="h-6 w-6" />,
    href: '/guides/build',
  },
  {
    name: 'Operations',
    description: 'Run, monitor, and maintain MCP servers in production.',
    icon: <Terminal className="h-6 w-6" />,
    href: '/guides/operations',
  },
  {
    name: 'Security',
    description: 'Secure your MCP servers and compliance requirements.',
    icon: <Shield className="h-6 w-6" />,
    href: '/guides/security',
  },
];

export default function GuidesPage() {
  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Guides</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Step-by-step guides for working with MCP servers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="block p-8 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-muted/25 rounded-lg">{cat.icon}</div>
              <h2 className="text-2xl font-semibold">{cat.name}</h2>
            </div>
            <p className="text-muted-foreground">{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
