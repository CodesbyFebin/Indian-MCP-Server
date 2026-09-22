// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MCPServer.in — India MCP Server Directory',
    short_name: 'MCPServer',
    description:
      'Discover verified MCP servers with evidence-backed claims for the India region.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        rel: 'icon',
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
    screenshots: [
      {
        src: '/og/home.png',
        sizes: '1200x630',
        type: 'image/png',
      },
    ],
  };
}
