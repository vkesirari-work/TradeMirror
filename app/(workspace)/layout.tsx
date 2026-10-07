import { Shell } from '@/components/dashboard/shell';
import { getWorkspaceAccount } from '@/lib/auth/session';
export const dynamic = 'force-dynamic';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}) {
  const account = await getWorkspaceAccount();
  return <Shell account={account}>{children}</Shell>;
}
