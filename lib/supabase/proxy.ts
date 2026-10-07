import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './config';
export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const client = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: values => {
        values.forEach(({name,value}) => request.cookies.set(name,value));
        response = NextResponse.next({ request });
        values.forEach(({name,value,options}) => response.cookies.set(name,value,options));
      },
    },
  });
  await client.auth.getClaims();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
