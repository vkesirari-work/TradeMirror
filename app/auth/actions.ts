'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { loginErrorMessage } from '@/lib/auth/feedback';
import { createClient } from '@/lib/supabase/server';
export interface AuthState { message: string; success?: boolean }
export async function authenticate(signup: boolean, _previous: AuthState, form: FormData): Promise<AuthState> {
  const client = await createClient();
  if (!client) return { message: 'Supabase is not configured. No credentials were sent. Explore the demo workspace below.' };
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  const name = String(form.get('name') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128 || (signup && (!name || name.length > 100))) return { message: 'Enter a valid email, an 8–128 character password, and your name when signing up.' };
  if (signup) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) return { message: 'The application confirmation URL has not been configured. Contact the project owner.' };
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: `${origin.replace(/\/$/,'')}/auth/confirm` } });
    if (error) return { message: 'Unable to create an account. Please try again later or log in if you already have one.' };
    if (!data.session) return { success: true, message: 'Check your email for a confirmation link. Open it in this same browser and site. If an account already exists, you can log in.' };
  } else {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { message: loginErrorMessage(error.code) };
  }
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
export async function signOut(): Promise<void> {
  const client = await createClient();
  if (client) {
    const { error } = await client.auth.signOut();
    if (error) throw new Error('Unable to sign out. Please retry.');
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
