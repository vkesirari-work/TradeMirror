import { getWorkspaceAccount } from '@/lib/auth/session';
import { AccountEmptyState } from '@/components/dashboard/account-empty-state';
import { ImportView } from '@/components/brokers/import-view';
export default async function ImportPage(){const account=await getWorkspaceAccount();if(account)return <AccountEmptyState account={account}/>;return <ImportView/>;}
