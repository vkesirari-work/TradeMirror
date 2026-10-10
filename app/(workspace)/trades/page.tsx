import { getWorkspaceAccount } from '@/lib/auth/session';
import { getAccountAnalytics } from '@/lib/workspace/analytics';
import { AccountJournal } from '@/components/trades/account-journal';
import { AnalysisNotice,Positions } from '@/components/dashboard/account-overview';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { TradeTable } from '@/components/trades/table';
export default async function Trades(){const account=await getWorkspaceAccount();if(account){let analytics;let failure='';try{analytics=await getAccountAnalytics();}catch(error){failure=error instanceof Error?error.message:'Unable to load the journal.';}
 if(!analytics)return <p className="inline-notice" role="alert">{failure}</p>;
 const {result,containsExample}=analytics;
 return <><div className="page-heading"><div><h1>Matched execution journal.</h1><p>FIFO slices from your saved history; costs and net P&L unavailable.</p></div><Link className="button primary" href="/import">Import trades</Link></div><AnalysisNotice result={result} containsExample={containsExample}/><Card><AccountJournal result={result}/></Card><Positions result={result}/></>;
 }return <><div className="page-heading"><div><span className="eyebrow">YOUR EXECUTION HISTORY</span><h1>Trade journal.</h1><p>A closer look at each decision. Sample trades · 7 October 2026.</p></div><Link className="button primary" href="/import"><Upload size={16}/>Import trades</Link></div><Card className="table-card"><TradeTable/></Card></>;}
