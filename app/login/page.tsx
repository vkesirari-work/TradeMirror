import { AuthForm } from '@/components/auth-form';
import { getSupabaseConfig } from '@/lib/supabase/config';
export default async function Login({searchParams}:{searchParams:Promise<{confirmation?:string}>}) {const params=await searchParams;return <AuthForm configured={!!getSupabaseConfig()} confirmationFailed={params.confirmation==='failed'}/>;}
