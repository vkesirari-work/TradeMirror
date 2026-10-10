import { getWorkspaceAccount } from '@/lib/auth/session';
import { getAccountAnalytics } from '@/lib/workspace/analytics';
import { AccountOverview } from '@/components/dashboard/account-overview';
import { Overview } from '@/components/dashboard/overview';
export default async function Dashboard(){
 const account=await getWorkspaceAccount();if(!account)return <Overview/>;
 let analytics;let failure='';try{analytics=await getAccountAnalytics();}catch(error){failure=error instanceof Error?error.message:'Unable to load account analytics.';}
 if(!analytics)return <p className="inline-notice" role="alert">{failure}</p>;
 return <AccountOverview name={account.name} {...analytics}/>;
}
