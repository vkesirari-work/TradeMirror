import { getWorkspaceAccount } from '@/lib/auth/session';
import { AccountEmptyState } from '@/components/dashboard/account-empty-state';
import { ReportView } from '@/components/reports/report-view';
export default async function Reports(){const account=await getWorkspaceAccount();if(account)return <AccountEmptyState account={account}/>;return <ReportView/>;}
