import {journalTags} from '@/lib/journal/index';
import { getWorkspaceAccount } from '@/lib/auth/session';
import { getAccountAnalytics } from '@/lib/workspace/analytics';
import { AccountJournal } from '@/components/trades/account-journal';
import { AnalysisNotice,Positions,ExampleScope } from '@/components/dashboard/account-overview';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { TradeTable } from '@/components/trades/table';
export default async function Trades({searchParams}:{searchParams:Promise<{examples?:string;day?:string}>}){const query=await searchParams;const includeExample=query.examples==='include';const initialDay=query.day&&/^\d{4}-\d{2}-\d{2}$/.test(query.day)?query.day:'';const analyticsLoad=getAccountAnalytics(includeExample).then(analytics=>({analytics,failure:''}),error=>({analytics:undefined,failure:error instanceof Error?error.message:'Unable to load the journal.'}));const account=await getWorkspaceAccount();if(account){const {analytics,failure}=await analyticsLoad;
 if(!analytics)return <p className="inline-notice" role="alert">{failure}</p>;
 const {result,containsExample,exampleCount}=analytics;const journal=await journalTags(result);
 return <><div className="page-heading"><div><h1>Matched execution journal.</h1><p>FIFO slices from your saved history; costs and net P&L unavailable.</p></div><Link className="button primary" href="/import">Import trades</Link></div><ExampleScope count={exampleCount} included={includeExample} route="/trades"/><AnalysisNotice result={result} containsExample={containsExample}/><Card><AccountJournal key={initialDay+':'+includeExample} result={result} initialDay={initialDay} initialTags={journal.tags} tagsError={journal.error}/></Card><Positions result={result}/></>;
 }return <><div className="page-heading"><div><span className="eyebrow">YOUR EXECUTION HISTORY</span><h1>Trade journal.</h1><p>A closer look at each decision. Sample trades · 7 October 2026.</p></div><Link className="button primary" href="/import"><Upload size={16}/>Import trades</Link></div><Card className="table-card"><TradeTable/></Card></>;}
