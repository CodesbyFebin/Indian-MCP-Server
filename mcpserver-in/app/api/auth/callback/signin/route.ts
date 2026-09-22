// app/api/auth/callback/signin/route.ts
// Sign-in callback handler — processes login form submission

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  // Serve a simple sign-in form
  const html = `<!DOCTYPE html>
<html>
<head><title>Sign In</title></head>
<body>
  <h1>Sign In</h1>
  <form method="POST">
    <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
    <p><input type="email" name="email" placeholder="Email" required /></p>
    <p><input type="password" name="password" type="password" placeholder="Password" required /></p>
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/';

  // Forward to NextAuth route
  const response = await fetch(
    new URL('/api/auth/callback/signin', request.url).toString(),
    {
      method: 'POST',
      body: formData,
      redirect: 'manual',
    },
  );

  if (response.ok) {
    return NextResponse.redirect(new URL(callbackUrl, request.url).toString());
  }

  return NextResponse.json(
    { error: 'Invalid credentials' },
    { status: 401 },
  );
}
