import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  const client = await createClient();
  const token = request.nextUrl.searchParams.get('token_hash');
  const code = request.nextUrl.searchParams.get('code');
  if (client && (token || code)) {
    const { error } = token ? await client.auth.verifyOtp({ token_hash: token, type: 'email' }) : await client.auth.exchangeCodeForSession(code!);
    if (!error) return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.redirect(new URL('/login?confirmation=failed', request.url));
}
