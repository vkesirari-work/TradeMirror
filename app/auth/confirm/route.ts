import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { confirmationFailureReason } from '@/lib/auth/feedback';
export async function GET(request: NextRequest) {
  const client = await createClient();
  const token = request.nextUrl.searchParams.get('token_hash');
  const code = request.nextUrl.searchParams.get('code');
  const store = await cookies();
  const recovery = store.get('tm-password-recovery')?.value === '1' || request.nextUrl.searchParams.get('type') === 'recovery';
  let reason = 'failed';
  if (client) {
    const { data: existing } = await client.auth.getUser();
    if (existing.user && !recovery) return NextResponse.redirect(new URL('/dashboard', request.url));
    if (token || code) {
      const { error } = token ? await client.auth.verifyOtp({ token_hash: token, type: recovery ? 'recovery' : 'email' }) : await client.auth.exchangeCodeForSession(code!);
      if (!error) {
        store.delete('tm-password-recovery');
        return NextResponse.redirect(new URL(recovery ? '/reset-password' : '/dashboard', request.url));
      }
      reason = confirmationFailureReason(error.code, error.message);
    }
  }
  return NextResponse.redirect(new URL(recovery ? `/forgot-password?error=${reason}` : `/login?confirmation=${reason}`, request.url));
}
