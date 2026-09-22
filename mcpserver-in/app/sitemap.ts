import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { servers } from '@/lib/db/schema';

const PUBLIC_ROUTES = [
  {
    url: '/',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'daily' as const,
    priority: 1,
  },
  {
    url: '/servers',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  },
  {
    url: '/guides',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: '/protocol',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/glossary',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/methodology',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/faq',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  },
  {
    url: '/pricing',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    url: '/report/india-mcp-2026',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/compliance/dpdp',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/compliance/rbi-cyber',
    lastModified: new Date('2026-09-01T00:00:00.000Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
];

function isIndexableServer(server: {
  status: string;
  verified: boolean;
}): boolean {
  return server.status === 'active' && server.verified;
}

function serverUrl(slug: string) {
  return `/servers/${slug}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedServers = await db.query.servers.findMany({
    columns: {
      slug: true,
      status: true,
      verified: true,
      updatedAt: true,
    },
    where: (server, { and, eq }) =>
      and(eq(server.status, 'active'), eq(server.verified, true)),
    orderBy: (server, { asc }) => asc(server.slug),
  });

  const publicRoutes = PUBLIC_ROUTES.map((route) => ({
    ...route,
    url: `${process.env.NEXT_PUBLIC_URL || 'https://www.mcpserver.in'}${route.url}`,
  }));

  const serverRoutes = publishedServers
    .filter(isIndexableServer)
    .map((server) => ({
      url: `${process.env.NEXT_PUBLIC_URL || 'https://www.mcpserver.in'}${serverUrl(server.slug)}`,
      lastModified: server.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...publicRoutes, ...serverRoutes];
}

export { isIndexableServer, serverUrl };
