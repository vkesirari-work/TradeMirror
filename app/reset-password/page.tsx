import { redirect } from 'next/navigation';
import { getSignedInUser } from '@/lib/auth/session';
import { PasswordForm } from '@/components/password-form';
export default async function ResetPassword() {
  if (!await getSignedInUser()) redirect('/forgot-password?error=session');
  return <PasswordForm reset/>;
}
