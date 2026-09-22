// components/server-detail.tsx
// Server detail page component

import { Server, ExternalLink, Github, Package, Globe, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { InferSelectModel } from 'drizzle-orm';
import { servers as serversTable } from '@/lib/db/schema';
type Server = InferSelectModel<typeof serversTable>;

interface ServerDetailProps {
  server: Server;
}

export function ServerDetail({ server }: ServerDetailProps) {
  const tools = (server.tools || []).slice(0, 6);
  const config = server.serverJson as Record<string, unknown> | undefined;

  return (
    <section className="container mx-auto py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{server.name}</h1>
            {server.verified && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>

          <p className="text-muted-foreground mb-4">{server.description}</p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-secondary/10 rounded-full text-sm">
              {server.category}
            </span>
            <span className="px-3 py-1 bg-secondary/10 rounded-full text-sm">
              {server.transport}
            </span>
            <span className="px-3 py-1 bg-secondary/10 rounded-full text-sm">
              {server.region}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {server.repoUrl && (
            <a
              href={server.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border hover:bg-muted/50"
              aria-label={`View ${server.name} repository`}
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {server.packageUrl && (
            <a
              href={server.packageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border hover:bg-muted/50"
              aria-label={`View ${server.name} package`}
            >
              <Package className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Tools */}
      {tools.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tools.map((tool: any) => (
              <div
                key={tool.name}
                className="border rounded-lg p-3 hover:bg-muted/25 transition-colors"
              >
                <h3 className="font-medium">{tool.name}</h3>
                {tool.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                )}
              </div>
            ))}
            {server.tools && server.tools.length > 6 && (
              <div className="text-sm text-muted-foreground">
                +{server.tools.length - 6} more tools
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Details */}
      {config && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="border rounded-lg p-4 bg-muted/25">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.versionPin && (
                <>
                  <dt className="text-sm text-muted-foreground">Version Pin</dt>
                  <dd>{config.versionPin as string}</dd>
                </>
              )}
              {config.transport && (
                <>
                  <dt className="text-sm text-muted-foreground">Transport</dt>
                  <dd>{config.transport as string}</dd>
                </>
              )}
              {config.tlsEnforced !== undefined && (
                <>
                  <dt className="text-sm text-muted-foreground">TLS Enforced</dt>
                  <dd>{config.tlsEnforced ? 'Yes' : 'No'}</dd>
                </>
              )}
              {config.mfaRequired !== undefined && (
                <>
                  <dt className="text-sm text-muted-foreground">MFA Required</dt>
                  <dd>{config.mfaRequired ? 'Yes' : 'No'}</dd>
                </>
              )}
              {config.sessionTimeoutMs && (
                <>
                  <dt className="text-sm text-muted-foreground">Session Timeout</dt>
                  <dd>{(config.sessionTimeoutMs as number) / 60000} minutes</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}
