'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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

export async function requestPasswordReset(_previous: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { message: 'Enter a valid email address.' };
  const client = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!client || !origin) return { message: 'Password recovery is not configured on this instance.' };
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${origin.replace(/\/$/, '')}/auth/confirm` });
  if (error) return { message: error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit' ? 'Too many requests. Wait a few minutes before trying again.' : 'Unable to send a reset link right now. Please try again later.' };
  (await cookies()).set('tm-password-recovery', '1', { httpOnly: true, secure: origin.startsWith('https:'), sameSite: 'lax', path: '/', maxAge: 3600 });
  return { success: true, message: 'If an account exists for this email, a reset link has been requested. Check your inbox and spam folder. Open the link in this same browser and site.' };
}
export async function updatePassword(_previous: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get('password') || '');
  const confirmation = String(form.get('confirmation') || '');
  if (password.length < 8 || password.length > 128) return { message: 'Use an 8–128 character password.' };
  if (password !== confirmation) return { message: 'The passwords do not match.' };
  const client = await createClient();
  if (!client) return { message: 'Password recovery is not configured.' };
  const { data, error: sessionError } = await client.auth.getUser();
  if (sessionError || !data.user) return { message: 'Your reset session has expired. Request a new reset link.' };
  const { error } = await client.auth.updateUser({ password });
  if (error) return { message: error.code === 'same_password' ? 'Choose a password different from your current one.' : 'Unable to update the password. Try a stronger password or request a fresh reset link.' };
  revalidatePath('/', 'layout');
  return { success: true, message: 'Password updated. Use your new password the next time you log in.' };
}
