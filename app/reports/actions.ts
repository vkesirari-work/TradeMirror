'use server';
import {createHash} from 'node:crypto';
import {createClient} from '@/lib/supabase/server';
import {getSignedInUser} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {reportSelection,reportSnapshot,validateSnapshot,type SavedSnapshot} from '@/lib/reports/snapshot';
async function owner(){const user=await getSignedInUser(),client=await createClient();if(!user||!client)throw new Error('Log in again to use saved reports.');return {user,client};}
export async function listSnapshots():Promise<{data?:SavedSnapshot[];error?:string}>{
 try{const {user,client}=await owner();const {data,error}=await client.from('report_snapshots').select('id,created_at,mode,period,fingerprint,payload').eq('user_id',user.id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(100);
 if(error)throw new Error('Saved report storage is unavailable. Complete report-history setup, then retry.');return {data:(data as SavedSnapshot[]).map(row=>({...row,payload:validateSnapshot(row.payload)}))};
 }catch(e){return {error:e instanceof Error?e.message:'Unable to load saved reports.'};}
}
export async function saveSnapshot(mode:unknown,date:unknown):Promise<{data?:SavedSnapshot;error?:string}>{
 try{const {user,client}=await owner();const {result}=await getAccountAnalytics();const period=reportSelection(result.matches,mode,date);
 const payload=reportSnapshot(period.rows,mode as 'daily'|'weekly',period.date);
 const evidence=period.rows.map(row=>JSON.stringify(row)).sort();const fingerprint=createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
 const {data,error}=await client.from('report_snapshots').insert({user_id:user.id,mode,period:period.date,fingerprint,payload}).select('id,created_at,mode,period,fingerprint,payload').single();
 if(error?.code==='23505'){const existing=await client.from('report_snapshots').select('id,created_at,mode,period,fingerprint,payload').eq('user_id',user.id).eq('mode',mode).eq('period',period.date).eq('fingerprint',fingerprint).single();if(!existing.error)return {data:{...existing.data,payload:validateSnapshot(existing.data.payload)} as SavedSnapshot};}
 if(error||!data)throw new Error('Could not save the report snapshot. Your executions are unchanged; retry after report-history setup.');return {data:{...data,payload:validateSnapshot(data.payload)} as SavedSnapshot};
 }catch(e){return {error:e instanceof Error?e.message:'Unable to save report.'};}
}
