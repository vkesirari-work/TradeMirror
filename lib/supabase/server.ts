import 'server-only';
import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';
export const createClient = cache(async () => {
  const config = getSupabaseConfig();
  if (!config) return null;
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: values => {
        try { values.forEach(({name,value,options}) => store.set(name,value,options)); }
        catch { /* Server Components cannot write cookies. Proxy handles refresh. */ }
      },
    },
  });
});
