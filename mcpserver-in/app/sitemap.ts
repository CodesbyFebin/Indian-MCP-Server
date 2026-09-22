// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all server slugs from the database
  const serverSlugs = await fetch(
    `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/v1/servers`,
  )
    .then((res) => res.json())
    .then(
      (data: { data: Array<{ slug: string }> }) =>
        data.data.map((server) => ({
          url: `https://www.mcpserver.in/servers/${server.slug}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        })),
    )
    .catch(() => []);

  return [
    {
      url: 'https://www.mcpserver.in',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.mcpserver.in/servers',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: 'https://www.mcpserver.in/protocol',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.mcpserver.in/glossary',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.mcpserver.in/methodology',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.mcpserver.in/faq',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: 'https://www.mcpserver.in/compliance/dpdp',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://www.mcpserver.in/compliance/rbi-cyber',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...serverSlugs,
  ];
}
