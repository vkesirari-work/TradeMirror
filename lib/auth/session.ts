import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export const getWorkspaceAccount = cache(async () => {
  const client = await createClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect('/login');
  const { data: profile, error: profileError } = await client.from('profiles').select('display_name').eq('id', data.user.id).single();
  return { id: data.user.id, email: data.user.email || '', name: profile?.display_name || 'Trader', profileUnavailable: !!profileError };
});

export async function getSignedInUser() {
  const client = await createClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
}
export async function redirectSignedInUser() {
  if (await getSignedInUser()) redirect('/dashboard');
}
