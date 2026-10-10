'use server';
import { DEFAULT_PLAN,validatePlan } from '@/lib/journal/plan';
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
 try{const {client,user,key}=await context(identity);const {data,error}=await client.from('journal_annotations').select('notes,tags,checklist,plan_items,revision').eq('user_id',user.id).eq('slice_key',key).maybeSingle();
 if(error)return {error:'Journal storage is unavailable. Your executions are unchanged; retry after setup is complete.'};
 return {data:data||{notes:'',tags:[],checklist:[false,false,false],revision:0}};
 }catch(error){return {error:error instanceof Error?error.message:'Unable to load your journal.'};}
}
export async function saveAnnotation(identity:string,value:unknown,revision:number):Promise<{data?:Annotation;error?:string}>{
 try{const content=validateAnnotation(value);if(!Number.isSafeInteger(revision)||revision<0||revision>=2147483647)throw new Error('Invalid journal revision.');
 const {client,user,key}=await context(identity);const row={...content,revision:revision+1};
 const response=revision===0?await client.from('journal_annotations').insert({...row,user_id:user.id,slice_key:key}).select('notes,tags,checklist,plan_items,revision').single():await client.from('journal_annotations').update(row).eq('user_id',user.id).eq('slice_key',key).eq('revision',revision).select('notes,tags,checklist,plan_items,revision').maybeSingle();
 if(response.error||!response.data)return {error:response.error&&response.error.code!=='23505'?'Could not save your journal. Keep your draft and retry.':'Another edit was saved. Copy your draft, then reload saved notes before retrying.'};
 return {data:response.data};
 }catch(error){return {error:error instanceof Error?error.message:'Unable to save your journal.'};}
}

export async function loadPlan():Promise<{data?:import('@/lib/journal/plan').PlanTemplate;error?:string}>{
 try{const user=await getSignedInUser(),client=await createClient();if(!user||!client)throw new Error('Log in again to use your plan.');
 const {data,error}=await client.from('journal_plan_templates').select('name,items,revision').eq('user_id',user.id).maybeSingle();
 if(error)return {error:'Plan storage is unavailable. Apply the plan-template migration before saving custom plans.'};
 return {data:data||{name:'My trading plan',items:[...DEFAULT_PLAN],revision:0}};
 }catch{return {error:'Unable to load your plan. Retry loading.'};}
}
export async function savePlan(value:unknown,revision:number):Promise<{data?:import('@/lib/journal/plan').PlanTemplate;error?:string}>{
 try{const content=validatePlan(value);if(!Number.isSafeInteger(revision)||revision<0||revision>=2147483647)throw new Error('Invalid plan revision.');
 const user=await getSignedInUser(),client=await createClient();if(!user||!client)throw new Error('Log in again to save your plan.');
 const row={...content,revision:revision+1};
 const response=revision===0?await client.from('journal_plan_templates').insert({...row,user_id:user.id}).select('name,items,revision').single():await client.from('journal_plan_templates').update(row).eq('user_id',user.id).eq('revision',revision).select('name,items,revision').maybeSingle();
 if(response.error||!response.data)return {error:'Plan could not be saved, or another edit was saved. Keep your draft; reload before retrying.'};return {data:response.data};
 }catch(error){return {error:error instanceof Error?error.message:'Unable to save your plan.'};}
}
