// app/servers/category/[category]/page.tsx
// Server listing by category

import { Suspense } from 'react';
import { db } from '@/lib/db';
import { servers } from '@/lib/db/schema';
import { ServersTable, ServersTableLoading } from '@/components/servers-table';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  return {
    title: `${category} MCP Servers | MCPServer.in`,
    description: `Browse ${category} MCP servers with evidence-backed claims.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  const allServers = await db.select().from(servers);
  const categories = new Set(allServers.map((s) => s.category));
  return Array.from(categories).map((cat) => ({ category: cat }));
}

export const revalidate = 3600;
export const dynamicParams = true;

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  const serverList = await db.query.servers.findMany({
    where: (s, { and, eq }) =>
      and(
        eq(s.category, category),
        eq(s.status, 'active'),
        eq(s.verified, true),
      ),
    orderBy: (s, { desc }) => desc(s.createdAt),
    limit: 50,
  });

  if (serverList.length === 0) {
    notFound();
  }

  // Convert DB objects to plain types
  const plainServers = serverList.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    description: s.description,
    category: s.category,
    status: s.status,
    transport: s.transport,
    repoUrl: s.repoUrl,
    packageUrl: s.packageUrl,
    versionPin: s.versionPin,
    region: s.region,
    verified: s.verified,
    serverJson: s.serverJson,
    tools: s.tools,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{category} MCP Servers</h1>
      <p className="text-muted-foreground mb-8">
        Discovered {plainServers.length} verified servers in this category.
      </p>
      <Suspense fallback={<ServersTableLoading />}>
        <ServersTable servers={plainServers} />
      </Suspense>
    </div>
  );
}
