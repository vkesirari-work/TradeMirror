import {getWorkspaceAccount} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {CostStatements} from '@/components/reports/cost-statements';
import Link from 'next/link';
export default async function Costs(){const account=await getWorkspaceAccount();if(!account)return <p>Broker statements require a configured account. <Link href="/demo">Explore demo</Link></p>;let analytics;let failure='';try{analytics=await getAccountAnalytics();}catch(e){failure=e instanceof Error?e.message:'Unable to load history.';}if(!analytics)return <p role="alert" className="inline-notice">{failure}</p>;return <><div className="page-heading"><div><span className="eyebrow">SOURCE-BASED COST REVIEW</span><h1>Broker costs & reconciliation.</h1><p>Review statement net results alongside imported gross execution history.</p></div></div><CostStatements matches={analytics.result.matches}/></>;}
