import { WorkspaceGuide } from './workspace-guide';
import { AdvancedWorkspace } from './advanced-workspace';
import { exactMoney } from '@/lib/analytics/format';
export { exactMoney } from '@/lib/analytics/format';
import Link from 'next/link';
import { Card,SectionTitle } from '@/components/ui/primitives';
import type { Fill,MatchingResult } from '@/lib/analytics/matching';
export function ist(value:string):string{return new Date(value).toLocaleString('en-IN',{timeZone:'Asia/Kolkata',dateStyle:'medium',timeStyle:'short'})+' IST';}
export function AnalysisNotice({result,containsExample}:{result:MatchingResult;containsExample:boolean}){
 return <><p className="sample-banner">FIFO analysis of imported history. Gross P&L excludes charges; net P&L is unavailable. Missing earlier positions, settlement executions or later fills can change results.</p>{containsExample&&<p className="inline-notice" role="alert">This account includes executions from the synthetic example CSV. These values are included in the totals below.</p>}{result.ambiguousTimestamps>0&&<p className="inline-notice" role="alert">{result.ambiguousTimestamps} timestamp groups contain both buys and sells with no sub-second ordering. A deterministic ID tie break was used; inspect these executions.</p>}</>;
}
export function ExampleScope({count,included,route}:{count:number;included:boolean;route:string}){
 if(!count)return null;
 return <p className="inline-notice">{count} synthetic example executions {included?'included in':'excluded from'} this view. <Link className="text-link" href={included?route:route+'?examples=include'}>{included?'Show real imports only':'Include example'}</Link> · Saved data is unchanged.</p>;
}
export function Positions({result}:{result:MatchingResult}){return <Card><SectionTitle title="Unmatched positions" subtitle="Full imported history · residual quantities · market values unavailable"/>{result.positions.length?<div className="table-scroll"><table><thead><tr><th>Instrument</th><th>Side</th><th>Remaining quantity</th><th>Entry price</th><th>Entry time</th></tr></thead><tbody>{result.positions.slice(0,100).map((p,i)=><tr key={i}><td>{p.symbol}</td><td>{p.side}</td><td>{p.quantity}</td><td>{exactMoney(p.entryPrice)}</td><td>{ist(p.entryTime)}</td></tr>)}</tbody></table></div>:<p>All imported quantities are matched. This does not independently confirm broker positions.</p>}{result.positions.length>100&&<p>Showing the first 100 residual lots. All lots are included in the count.</p>}</Card>;}
export function AccountOverview({name,fills,result,containsExample,exampleCount,includeExample}:{name:string;fills:Fill[];result:MatchingResult;containsExample:boolean;exampleCount:number;includeExample:boolean}){
 if(!fills.length)return <><ExampleScope count={exampleCount} included={includeExample} route="/dashboard"/><WorkspaceGuide name={name}/></>;
 return <><div className="page-heading"><div><span className="eyebrow">PERFORMANCE WORKSPACE</span><h1>Your trading, decoded.</h1><p>Calculated from {fills.length} saved executions across the full imported history.</p></div><Link href="/import" className="button primary">Import trades</Link></div><ExampleScope count={exampleCount} included={includeExample} route="/dashboard"/><AnalysisNotice result={result} containsExample={containsExample}/><AdvancedWorkspace result={result} includeExample={includeExample}/><Positions result={result}/><WorkspaceGuide ready/></>;
}
