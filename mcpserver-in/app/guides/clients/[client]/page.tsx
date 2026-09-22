// app/guides/clients/[client]/page.tsx
// Client-specific setup guides

import { Metadata } from 'next';

const clientGuides: Record<string, { name: string; steps: string[]; downloadLink?: string }> = {
  'claude-desktop': {
    name: 'Claude Desktop',
    steps: [
      'Download Claude Desktop from claude.ai/download',
      'Open Claude Desktop → Settings → Developers → Edit Config',
      'Add MCP server configuration in claude_desktop_config.json',
      'Restart Claude Desktop',
      'Test with tools/list command in Claude conversation',
    ],
  },
  'cursor': {
    name: 'Cursor',
    steps: [
      'Open Cursor → Command Palette → MCP: Add Server',
      'Enter the MCP server URL or connection details',
      'Or manually add to .cursor/mcp.json',
      'Restart Cursor to apply changes',
      'Test in chat with tools/list',
    ],
  },
  'vscode': {
    name: 'VS Code',
    steps: [
      'Install the "MCP" extension from the VS Code marketplace',
      'Open Command Palette → MCP: Manage Servers',
      'Click "Add Server" and enter connection details',
      'Save configuration',
      'Test in VS Code Copilot chat',
    ],
  },
  'codex': {
    name: 'Codex (OpenAI)',
    steps: [
      'Install the codex-mcp package',
      'Configure in ~/.codex/config.yaml',
      'Add the mcp_servers section with your server details',
      'Run codex to verify server connectivity',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(clientGuides).map((client) => ({ client }));
}

interface PageProps {
  params: Promise<{ client: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { client } = await params;
  const guide = clientGuides[client];
  if (!guide) return { title: 'Not Found | MCPServer.in' };
  return {
    title: `${guide.name} Setup Guide | MCPServer.in`,
    description: `Step-by-step guide to configure ${guide.name} with MCP servers.`,
  };
}

export default async function ClientGuidePage({ params }: PageProps) {
  const { client } = await params;
  const guide = clientGuides[client];

  if (!guide) {
    return (
      <div className="container mx-auto py-16">
        <h1 className="text-2xl font-bold mb-4">Guide Not Found</h1>
        <p className="text-muted-foreground">
          No setup guide available for "{client}".
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">{guide.name} Setup Guide</h1>
        <p className="text-xl text-muted-foreground">
          Configure {guide.name} to connect to MCP servers.
        </p>
      </div>

      <ol className="space-y-4">
        {guide.steps.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-4 p-4 border rounded-lg"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
              {i + 1}
            </div>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      {guide.downloadLink && (
        <div className="mt-8">
          <a
            href={guide.downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Download {guide.name}
          </a>
        </div>
      )}
    </div>
  );
}
