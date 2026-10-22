import Link from 'next/link';
import { ImportView } from '@/components/brokers/import-view';
import { getWorkspaceAccount } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
export default async function ImportPage(){
 const account=await getWorkspaceAccount();const client=account?await createClient():null;
 const result=client?await client.from('broker_imports').select('id,file_name,status,row_count,created_at').order('created_at',{ascending:false}).limit(20):null;
 return <><ImportView configured={!!account}/>{account&&<p className="inline-notice">Have the Zerodha F&O P&L XLSX too? <Link className="text-link" href="/costs">Import broker charges and reconcile statement net →</Link></p>}{account&&<section className="import-history"><div className="import-history-heading"><h2>Recent imports</h2><p>Your last 20 saved files · overlaps are skipped</p></div>{result?.error?<p className="inline-notice">Import history could not be loaded. Please retry.</p>:result?.data?.length?<div className="table-scroll"><table><thead><tr><th>File</th><th>Status</th><th>File executions</th><th>Saved</th></tr></thead><tbody>{result.data.map(item=><tr key={item.id}><td>{item.file_name}</td><td><span className={item.status==='COMPLETED'?'badge green':'badge neutral'}>{item.status}</span></td><td>{item.row_count}</td><td>{new Date(item.created_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</td></tr>)}</tbody></table></div>:<p>No saved imports yet.</p>}<p className="fineprint">File executions count the unique rows submitted in each file, including executions already saved by an earlier file. Do not add these counts together. Your dashboard counts saved executions once; matching slices can split fills and have a different count.</p></section>}</>;
}
