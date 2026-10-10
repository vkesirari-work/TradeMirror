import { getWorkspaceAccount } from '@/lib/auth/session';
import { getAccountAnalytics } from '@/lib/workspace/analytics';
import { AccountOverview } from '@/components/dashboard/account-overview';
import { Overview } from '@/components/dashboard/overview';
export default async function Dashboard({searchParams}:{searchParams:Promise<{examples?:string}>}){
 const includeExample=(await searchParams).examples==='include';
 const analyticsLoad=getAccountAnalytics(includeExample).then(analytics=>({analytics,failure:''}),error=>({analytics:undefined,failure:error instanceof Error?error.message:'Unable to load account analytics.'}));
 const account=await getWorkspaceAccount();if(!account)return <Overview/>;
 const {analytics,failure}=await analyticsLoad;
 if(!analytics)return <p className="inline-notice" role="alert">{failure}</p>;
 return <AccountOverview name={account.name} {...analytics}/>;
}
