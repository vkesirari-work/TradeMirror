import {getSignedInUser} from '@/lib/auth/session';
import {createClient} from '@/lib/supabase/server';
import {validateSnapshot} from '@/lib/reports/snapshot';
import {validateStatement} from '@/lib/costs/zerodha';
import type {SavedSnapshot} from '@/lib/reports/snapshot';
import type {StatementRecord} from '@/app/costs/actions';

type Result={ok:true;kind:'snapshot';record:SavedSnapshot}|{ok:true;kind:'statement';record:StatementRecord}|{ok:false;error:string;status:number};
function failure(error:string,status:number):Result{return {ok:false,error,status};}
export async function readSavedExport(kind:unknown,id:unknown):Promise<Result>{
 if((kind!=='snapshot'&&kind!=='statement')||typeof id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return failure('Choose a saved report or statement to export.',400);
 try{
  const user=await getSignedInUser();if(!user)return failure('Log in again to download your saved record.',401);
  const client=await createClient();if(!client)return failure('Saved exports are unavailable. Retry later.',503);
  const {data,error}=kind==='snapshot'
   ?await client.from('report_snapshots').select('id,created_at,fingerprint,mode,period,payload').eq('user_id',user.id).eq('id',id).maybeSingle()
   :await client.from('broker_statements').select('id,created_at,fingerprint,payload').eq('user_id',user.id).eq('id',id).maybeSingle();
  if(error)return failure('Unable to read this saved record. Retry later.',503);
  // A missing record and another owner's record are indistinguishable.
  if(!data)return failure('Saved record not found in your account.',404);
  const base={id:data.id,created_at:data.created_at,fingerprint:data.fingerprint};
  if(kind==='snapshot'){
   const payload=validateSnapshot(data.payload);
   if(payload.scope!=='real imports only'||!('mode' in data)||!('period' in data)||data.mode!==payload.mode||data.period!==payload.period)return failure('Saved report evidence is inconsistent. No export was created.',422);
   return {ok:true,kind:'snapshot',record:{...base,mode:payload.mode,period:payload.period,payload}};
  }
  return {ok:true,kind:'statement',record:{...base,payload:validateStatement(data.payload)}};
 }catch{
  return failure('Unable to validate this saved export. No partial file was created.',422);
 }
}
