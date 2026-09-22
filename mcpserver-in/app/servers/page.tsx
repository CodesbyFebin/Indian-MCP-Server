// app/servers/page.tsx
// Server Directory — RSC, filterable, ISR cached for 1h

import { Suspense } from 'react';
import { cache } from 'react';
import { db } from '@/lib/db';
import { servers } from '@/lib/db/schema';
import { ServersTable, ServersTableLoading } from '@/components/servers-table';
import { ServerFilters } from '@/components/servers-filters';

// ISR: revalidate every hour
export const revalidate = 3600;

// Cached query for server list
const getServers = cache(async (filters?: {
  category?: string;
  search?: string;
  verified?: boolean;
}) => {
  'use cache';

  const result = await db.query.servers.findMany({
    where: (servers, { and, eq, like }) => {
      const conditions = [];
      if (filters?.verified !== undefined) {
        conditions.push(eq(servers.verified, filters.verified));
      }
      if (filters?.category) {
        conditions.push(eq(servers.category, filters.category));
      }
      if (filters?.search) {
        conditions.push(like(servers.name, `%${filters.search}%`));
      }
      return and(...conditions);
    },
    orderBy: (servers, { desc }) => desc(servers.createdAt),
    limit: 50,
  });

  return result;
});

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const category = typeof sp?.category === 'string' ? sp.category : undefined;

  const title = category
    ? `MCP Servers — ${category} | MCPServer.in`
    : 'MCP Server Directory | MCPServer.in';

  return {
    title,
    description: category
      ? `Browse ${category} MCP servers with evidence-backed claims.`
      : 'Directory of certified MCP servers for the India region.',
    robots: {
      index: !category,
      follow: true,
    },
  };
}

export default async function ServersPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const filters = {
    category: typeof sp?.category === 'string' ? sp.category : undefined,
    search: typeof sp?.search === 'string' ? sp.search : undefined,
    verified:
      typeof sp?.verified === 'string' ? sp.verified === 'true' : undefined,
  };

  const serverList = await getServers(filters);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">MCP Server Directory</h1>
        <p className="text-muted-foreground">
          Discover verified MCP servers with evidence-backed capability claims.
          All servers are tested against the 2026-07-28 MCP specification.
        </p>
      </div>

      <ServerFilters />

      <Suspense fallback={<ServersTableLoading />}>
        <ServersTable servers={serverList} />
      </Suspense>
    </div>
  );
}
