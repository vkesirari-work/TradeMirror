import { PasswordForm } from '@/components/password-form';
export default async function ForgotPassword({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const {error} = await searchParams;
  const notice = error === 'browser' ? 'The reset link could not open a session. Request a new link and open it in this same browser and site.' : error === 'failed' || error === 'session' ? 'Your reset link or session is invalid or expired. Request a new link below.' : null;
  return <PasswordForm notice={notice}/>;
}
