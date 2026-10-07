import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmationFailureReason } from '@/lib/auth/feedback';
export async function GET(request: NextRequest) {
  const client = await createClient();
  const token = request.nextUrl.searchParams.get('token_hash');
  const code = request.nextUrl.searchParams.get('code');
  let reason = 'failed';
  if (client) {
    const { data: existing } = await client.auth.getUser();
    if (existing.user) return NextResponse.redirect(new URL('/dashboard', request.url));
    if (token || code) {
      const { error } = token ? await client.auth.verifyOtp({ token_hash: token, type: 'email' }) : await client.auth.exchangeCodeForSession(code!);
      if (!error) return NextResponse.redirect(new URL('/dashboard', request.url));
      reason = confirmationFailureReason(error.code, error.message);
    }
  }
  return NextResponse.redirect(new URL(`/login?confirmation=${reason}`, request.url));
}
