export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url && !key) return null;
  if (!url || !key) throw new Error('Set both Supabase URL and publishable key.');
  const parsed = new URL(url);
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Invalid Supabase URL.');
  if (key.startsWith('sb_secret_')) throw new Error('Use a publishable key, never a secret key.');
  if (key.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role === 'service_role') throw new Error('Privileged key');
    } catch { throw new Error('Use a publishable key, never a privileged or invalid JWT key.'); }
  }
  return { url, key };
}
