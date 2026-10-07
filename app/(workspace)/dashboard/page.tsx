import { getWorkspaceAccount } from '@/lib/auth/session';
import { AccountEmptyState } from '@/components/dashboard/account-empty-state';
import { Overview } from '@/components/dashboard/overview';
export default async function Dashboard(){const account=await getWorkspaceAccount();if(account)return <AccountEmptyState account={account}/>;return <Overview/>;}
