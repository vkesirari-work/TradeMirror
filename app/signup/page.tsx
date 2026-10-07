import { AuthForm } from '@/components/auth-form';
import { getSupabaseConfig } from '@/lib/supabase/config';
export const dynamic='force-dynamic';
export default function Signup(){return <AuthForm signup configured={!!getSupabaseConfig()}/>;}
