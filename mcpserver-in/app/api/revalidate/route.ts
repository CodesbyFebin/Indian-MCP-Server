// app/api/revalidate/route.ts
// Cache revalidation endpoint — protected

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;

export async function POST(request: NextRequest) {
  // Validate token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${REVALIDATE_TOKEN}`) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const { path, tag } = body;

    if (tag) {
      // Revalidate specific tag (with cacheLife per Next 16)
      revalidateTag(tag, 'max');
    } else if (path) {
      // Revalidate specific path
      revalidatePath(path, 'layout');
    } else {
      // Revalidate everything
      revalidateTag('servers', 'max');
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      message: 'Revalidated',
      revalidated: true,
      path,
      tag,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error during revalidation', error: String(error) },
      { status: 500 },
    );
  }
}
