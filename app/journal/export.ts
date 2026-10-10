'use server';
import {createHash} from 'node:crypto';
import {createClient} from '@/lib/supabase/server';
import {getSignedInUser} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {sliceIdentity} from '@/lib/journal/annotation';
export async function exportJournal():Promise<{data?:string;error?:string}>{
 try{const user=await getSignedInUser(),client=await createClient();if(!user||!client)throw new Error('Log in again to export your journal.');
 const rows:Record<string,unknown>[]=[];
 for(let offset=0;offset<=1000;offset+=100){const {data,error}=await client.from('journal_annotations').select('slice_key,notes,tags,checklist,plan_items,revision').eq('user_id',user.id).order('slice_key').range(offset,offset+99);
 if(error||!data)throw new Error('Unable to read your journal. Retry.');if(offset+data.length>1000)throw new Error('Journal export supports up to 1,000 annotations. No partial backup was created.');rows.push(...data);if(data.length<100)break;}
 const {result}=await getAccountAnalytics(true);const evidence=new Map(result.matches.map(m=>[createHash('sha256').update(sliceIdentity(m)).digest('hex'),m]));
 const {data:plan,error}=await client.from('journal_plan_templates').select('name,items,revision').eq('user_id',user.id).maybeSingle();if(error)throw new Error('Unable to read your plan. No partial backup was created.');
 const backup={format:'trademirror-journal',version:1,exportedAt:new Date().toISOString(),annotations:rows.map(row=>({...row,evidence:evidence.get(String(row.slice_key))||null,connection:evidence.has(String(row.slice_key))?'linked':'unlinked'})),plan,limits:'Journal and plan export only, including retained unlinked annotations. Original CSVs, raw executions and report snapshots are not included. Restore is not yet supported.'};
 const data=JSON.stringify(backup,null,2);if(Buffer.byteLength(data,'utf8')>5*1024*1024)throw new Error('Journal export exceeds the 5 MB limit. No partial backup was created.');return {data};
 }catch(e){return {error:e instanceof Error?e.message:'Unable to export the journal.'};}
}
