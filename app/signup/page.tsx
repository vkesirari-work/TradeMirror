import { AuthForm } from '@/components/auth-form';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { redirectSignedInUser } from '@/lib/auth/session';
export const dynamic='force-dynamic';
export default async function Signup(){
  await redirectSignedInUser();
  return <AuthForm signup configured={!!getSupabaseConfig()}/>;
}
