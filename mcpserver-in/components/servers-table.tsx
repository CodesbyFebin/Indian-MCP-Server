// components/servers-table.tsx
// Server listing table with pagination

import Image from 'next/image';
import Link from 'next/link';
import { Server, Evidence } from '@/lib/db/schema';
import { CheckCircle, ExternalLink } from 'lucide-react';

function ServersTableLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );
}

function ServerRow({ server }: { server: Server }) {
  return (
    <Link
      href={`/servers/${server.slug}`}
      className="block hover:bg-muted/25 rounded-lg p-4 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{server.name}</h3>
            {server.verified && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                server.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : server.status === 'under_review'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {server.status}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {server.description}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-secondary/10 px-2 py-0.5 rounded">{server.category}</span>
            <span className={`px-2 py-0.5 rounded ${
              server.transport === 'stdio'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {server.transport}
            </span>
            <span className="bg-gray-100 px-2 py-0.5 rounded">{server.region}</span>
          </div>
        </div>

        {server.repoUrl && (
          <a
            href={server.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-4 p-2 text-muted-foreground hover:text-foreground"
            aria-label={`View ${server.name} on ${server.repoUrl}`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </Link>
  );
}

export function ServersTable({ servers }: { servers: Server[] }) {
  if (servers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No servers found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {servers.map((server) => (
        <ServerRow key={server.id} server={server} />
      ))}
    </div>
  );
}

export { ServersTableLoading };
