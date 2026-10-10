import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export const getWorkspaceAccount = cache(async () => {
  const client = await createClient();
  if (!client) return null;
  const user = await getSignedInUser();
  if (!user) redirect('/login');
  const { data: profile, error: profileError } = await client.from('profiles').select('display_name').eq('id', user.id).single();
  return { id: user.id, email: user.email || '', name: profile?.display_name || 'Trader', profileUnavailable: !!profileError };
});

export const getSignedInUser = cache(async () => {
  const client = await createClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
});
export async function redirectSignedInUser() {
  if (await getSignedInUser()) redirect('/dashboard');
}
