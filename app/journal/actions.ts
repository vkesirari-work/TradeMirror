'use server';
import { createHash } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { getSignedInUser } from '@/lib/auth/session';
import { getAccountAnalytics } from '@/lib/workspace/analytics';
import { sliceIdentity,validateAnnotation,type Annotation } from '@/lib/journal/annotation';
async function context(identity:string){
 if(typeof identity!=='string'||identity.length>4000)throw new Error('Unsupported execution identity.');
 const user=await getSignedInUser();const client=await createClient();
 if(!user||!client)throw new Error('Log in again to use your journal.');
 const {result}=await getAccountAnalytics(true);
 if(!result.matches.some(match=>sliceIdentity(match)===identity))throw new Error('This matching slice changed or is no longer available. Refresh the journal before editing.');
 return {client,user,key:createHash('sha256').update(identity).digest('hex')};
}
export async function loadAnnotation(identity:string):Promise<{data?:Annotation;error?:string}>{
 try{const {client,user,key}=await context(identity);const {data,error}=await client.from('journal_annotations').select('notes,tags,checklist,revision').eq('user_id',user.id).eq('slice_key',key).maybeSingle();
 if(error)return {error:'Journal storage is unavailable. Your executions are unchanged; retry after setup is complete.'};
 return {data:data||{notes:'',tags:[],checklist:[false,false,false],revision:0}};
 }catch(error){return {error:error instanceof Error?error.message:'Unable to load your journal.'};}
}
export async function saveAnnotation(identity:string,value:unknown,revision:number):Promise<{data?:Annotation;error?:string}>{
 try{const content=validateAnnotation(value);if(!Number.isSafeInteger(revision)||revision<0||revision>=2147483647)throw new Error('Invalid journal revision.');
 const {client,user,key}=await context(identity);const row={...content,revision:revision+1};
 const response=revision===0?await client.from('journal_annotations').insert({...row,user_id:user.id,slice_key:key}).select('notes,tags,checklist,revision').single():await client.from('journal_annotations').update(row).eq('user_id',user.id).eq('slice_key',key).eq('revision',revision).select('notes,tags,checklist,revision').maybeSingle();
 if(response.error||!response.data)return {error:response.error&&response.error.code!=='23505'?'Could not save your journal. Keep your draft and retry.':'Another edit was saved. Copy your draft, then reload saved notes before retrying.'};
 return {data:response.data};
 }catch(error){return {error:error instanceof Error?error.message:'Unable to save your journal.'};}
}
