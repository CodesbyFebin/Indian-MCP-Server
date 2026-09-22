// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/(app)/*',
          '/api/revalidate',
        ],
      },
      {
        userAgent: 'AdsBot-Google',
        disallow: '/',
      },
    ],
    sitemap: 'https://www.mcpserver.in/sitemap.xml',
    host: 'https://www.mcpserver.in',
  };
}
