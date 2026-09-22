// app/api/og/route.tsx
// Open Graph image generation endpoint
// Generates custom OG images for server pages

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'MCPServer.in';
  const slug = searchParams.get('slug') || 'mcpserver';
  const subtitle = searchParams.get('subtitle') || 'Verified MCP Server';

  // Load fonts (edge runtime has limited font loading)
  const interBold = fetch(
    new URL('../../public/fonts/Inter-Bold.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer());

  const interRegular = fetch(
    new URL('../../public/fonts/Inter-Regular.ttf', import.meta.url),
  ).then((res) => res.arrayBuffer());

  try {
    const [interBoldData, interRegularData] = await Promise.all([
      interBold,
      interRegular,
    ]);

    // Split title if too long
    const displayTitle = title.length > 40
      ? title.substring(0, 37) + '...'
      : title;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
            color: 'white',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 700,
              fontFamily: 'Inter',
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          >
            {displayTitle}
          </div>
          <div
            style={{
              fontSize: '24px',
              fontFamily: 'Inter',
              opacity: 0.9,
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              fontSize: '16px',
              fontFamily: 'Inter',
              marginTop: '24px',
              opacity: 0.8,
            }}
          >
            www.mcpserver.in
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: interBoldData,
            style: 'normal',
            weight: 700,
          },
          {
            name: 'Inter',
            data: interRegularData,
            style: 'normal',
            weight: 400,
          },
        ],
      },
    );
  } catch (error) {
    // Fallback without custom fonts
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
            color: 'white',
            padding: '40px',
            textAlign: 'center',
            fontSize: '48px',
            fontWeight: 700,
          }}
        >
          {title}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }
}
