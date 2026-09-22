// app/api/auth/signin/route.ts — fixed version
// Redirects to the callback page

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Redirect to the sign-in form at the callback path
  return NextResponse.redirect(
    new URL(`/api/auth/callback/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url),
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/';

  // Delegate to the auth callback handler
  const callbackUrl_ = new URL('/api/auth/callback/signin', request.url).toString();

  const response = await fetch(callbackUrl_, {
    method: 'POST',
    body: formData,
    redirect: 'manual',
  });

  if (response.ok) {
    return NextResponse.redirect(new URL(callbackUrl, request.url).toString());
  }

  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 },
  );
}
