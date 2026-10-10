import { getWorkspaceAccount } from '@/lib/auth/session';
import { getAccountAnalytics } from '@/lib/workspace/analytics';
import { AccountReports } from '@/components/reports/account-reports';
import { ReportView } from '@/components/reports/report-view';
export default async function Reports(){
 const account=await getWorkspaceAccount();if(!account)return <ReportView/>;
 let analytics;let failure='';try{analytics=await getAccountAnalytics();}catch(error){failure=error instanceof Error?error.message:'Unable to load reports.';}
 if(!analytics)return <p className="inline-notice" role="alert">{failure}</p>;
 return <><div className="page-heading"><div><span className="eyebrow">A REGULAR REVIEW OF YOUR HISTORY</span><h1>Your performance reports.</h1><p>Daily and weekly gross reviews · synthetic example excluded · all times IST.</p></div></div><AccountReports matches={analytics.result.matches}/></>;
}
