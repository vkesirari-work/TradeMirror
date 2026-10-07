import { AuthForm } from '@/components/auth-form';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { redirectSignedInUser } from '@/lib/auth/session';
import { confirmationMessage } from '@/lib/auth/feedback';
export default async function Login({searchParams}:{searchParams:Promise<{confirmation?:string}>}) {
  await redirectSignedInUser();
  const params = await searchParams;
  return <AuthForm configured={!!getSupabaseConfig()} confirmationNotice={confirmationMessage(params.confirmation)}/>;
}
