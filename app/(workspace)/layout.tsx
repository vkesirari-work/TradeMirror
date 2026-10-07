import { Shell } from '@/components/dashboard/shell';
import { EmptyState } from '@/components/ui/primitives';
import { getWorkspaceAccount } from '@/lib/auth/session';
export const dynamic = 'force-dynamic';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}) {
  const account = await getWorkspaceAccount();
  return <Shell account={account}>{account ? <><EmptyState title={`Welcome, ${account.name}`} body="Your account is ready. Tradebook imports and live analytics arrive in the next phases. No sample trades are attached to your account."/>{account.profileUnavailable && <p className="inline-notice">Your profile could not be loaded. Check that the database migration has been applied.</p>}</> : children}</Shell>;
}
