import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/.well-known/',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_URL || 'https://www.mcpserver.in'}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_URL || 'https://www.mcpserver.in',
  };
}
