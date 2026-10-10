'use server';
import {createClient} from '@/lib/supabase/server';
import {getSignedInUser} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {reportSelection} from '@/lib/reports/snapshot';
import {AI_INSTRUCTIONS,REVIEW_SCHEMA,reviewEvidence,responseReview,type AiReview} from '@/lib/reports/ai';
export async function generateAiReview(mode:unknown,date:unknown,consent:unknown):Promise<{data?:AiReview;evidence?:ReturnType<typeof reviewEvidence>;error?:string}>{
 try{if(process.env.TRADEMIRROR_ENABLE_PAID_AI!=='true')throw new Error('Paid AI is disabled in this free edition. Use the computed period review instead.');if(consent!==true)throw new Error('Confirm sharing this period’s computed metrics with OpenAI first.');const user=await getSignedInUser(),client=await createClient();if(!user||!client)throw new Error('Log in again to generate a review.');
 const key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;if(!key||!model)throw new Error('AI setup required: configure the server API key and model. Computed reviews remain available.');
 const {result}=await getAccountAnalytics();const period=reportSelection(result.matches,mode,date);const evidence=reviewEvidence(period.rows);
 const reserved=await client.rpc('reserve_ai_review');if(reserved.error)throw new Error('AI usage controls are not ready. Complete report-history setup before generating reviews.');if(reserved.data!==true)throw new Error('Please wait 90 seconds between requests. Up to five attempts are available per UTC day; failed provider requests also count.');
 const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,store:false,instructions:AI_INSTRUCTIONS,input:JSON.stringify({period:period.date,mode,evidence}),max_output_tokens:1400,text:{format:{type:'json_schema',name:'trading_review',strict:true,schema:REVIEW_SCHEMA}}}),signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw new Error(response.status===429?'AI provider limit reached. Retry later.':'AI provider could not complete the review. Check the configured model and server setup.');return {data:responseReview(await response.json()),evidence};
 }catch(e){return {error:e instanceof Error&&!e.message.includes('fetch')?e.message:'AI connection timed out or failed. Retry later.'};}
}
