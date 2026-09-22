// app/servers/[slug]/page.tsx
// Server Detail Page — SSG for static paths, dynamic evidence ledger

import { db } from '@/lib/db';
import { servers, evidence, type Server as ServerType } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { EvidenceLedger } from '@/components/evidence-ledger';
import { ServerDetail } from '@/components/server-detail';

// Generate static paths for all known servers at build time
export async function generateStaticParams() {
  const allServers = await db.select().from(servers);
  return allServers.map((server) => ({ slug: server.slug }));
}

// Revalidate static pages every hour
export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getServer(slug: string): Promise<ServerType | null> {
  return db.query.servers.findFirst({
    where: { slug },
  });
}

async function getServerEvidence(serverId: string) {
  return db.query.evidence.findMany({
    where: { serverId },
    orderBy: (ev, { desc }) => desc(ev.verifiedAt),
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const server = await getServer(slug);

  if (!server) {
    return { title: 'Server Not Found | MCPServer.in' };
  }

  return {
    title: `${server.name} | Verified MCP Server | MCPServer.in`,
    description: server.description,
    openGraph: {
      title: server.name,
      description: server.description,
      type: 'website',
      images: [
        {
          url: `/api/og?slug=${server.slug}&title=${encodeURIComponent(server.name)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `https://www.mcpserver.in/servers/${server.slug}`,
    },
  };
}

export default async function ServerPage({ params }: PageProps) {
  const { slug } = await params;
  const server = await getServer(slug);

  if (!server) {
    notFound();
  }

  const serverEvidence = await getServerEvidence(server.id);

  return (
    <>
      <ServerDetail server={server} />
      <EvidenceLedger evidence={serverEvidence} serverName={server.name} />
    </>
  );
}
