import {getSignedInUser} from '@/lib/auth/session';
import {createClient} from '@/lib/supabase/server';
import {validateSnapshot} from '@/lib/reports/snapshot';
import {validateStatement} from '@/lib/costs/zerodha';
import {exportError,jsonAttachment} from '@/lib/exports/http';

export const dynamic='force-dynamic';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const kind=params.get('kind'),id=params.get('id');
 if((kind!=='snapshot'&&kind!=='statement')||!id||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return exportError('Choose a saved report or statement to export.',400);
 try{
  const user=await getSignedInUser();if(!user)return exportError('Log in again to download your saved record.',401);
  const client=await createClient();if(!client)return exportError('Saved exports are unavailable. Retry later.',503);
  const {data,error}=kind==='snapshot'
   ?await client.from('report_snapshots').select('id,created_at,fingerprint,mode,period,payload').eq('user_id',user.id).eq('id',id).maybeSingle()
   :await client.from('broker_statements').select('id,created_at,fingerprint,payload').eq('user_id',user.id).eq('id',id).maybeSingle();
  if(error)return exportError('Unable to read this saved record. Retry later.',503);
  // A missing record and another owner's record are indistinguishable.
  if(!data)return exportError('Saved record not found in your account.',404);
  const base={id:data.id,created_at:data.created_at,fingerprint:data.fingerprint};
  if(kind==='snapshot'){
   const payload=validateSnapshot(data.payload);
   if(!('mode' in data)||!('period' in data)||data.mode!==payload.mode||data.period!==payload.period)return exportError('Saved report evidence is inconsistent. No export was created.',422);
   return jsonAttachment({...base,mode:data.mode,period:data.period,payload},`trademirror-snapshot-${id.toLowerCase()}.json`);
  }
  return jsonAttachment({...base,payload:validateStatement(data.payload)},`trademirror-statement-${id.toLowerCase()}.json`);
 }catch{
  return exportError('Unable to validate this saved export. No partial file was created.',422);
 }
}
