'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseZerodhaCsv,MAX_CSV_BYTES } from '@/lib/brokers/adapters/zerodha-csv';
export async function saveCsv(form:FormData):Promise<{message:string;success?:boolean}> {
 const client=await createClient();if(!client)return {message:'Log in to save a tradebook.'};
 const {data,error:authError}=await client.auth.getUser();if(authError||!data.user)return {message:'Your session has expired. Log in again.'};
 const file=form.get('file');if(!(file instanceof File)||!file.name.toLowerCase().endsWith('.csv')||file.size>MAX_CSV_BYTES)return {message:'Choose a CSV no larger than 5 MB.'};
 let preview;try{preview=parseZerodhaCsv(await file.text());}catch(error){return {message:error instanceof Error?error.message:'Unable to read CSV.'};}
 if(preview.issues.length||!preview.executions.length)return {message:'Fix all validation errors before saving.'};
 const records=preview.executions.map(({row,...execution})=>{void row;return execution;});
 const {data:result,error}=await client.rpc('import_zerodha_executions',{p_file_name:file.name.slice(0,255),p_records:records});
 if(error)return {message:error.code==='PGRST202'?'Saving is not activated yet. The CSV import database migration must be applied.':error.message.includes('Conflicting execution')?'An existing execution has different values for this trade ID. Nothing was saved.':'Import failed. Nothing was saved; try again or check the file.'};
 revalidatePath('/import');
 return {success:true,message:`Saved ${result.inserted} new executions. Skipped ${result.duplicates+preview.duplicates} repeated executions. Trade matching and dashboard analytics come next.`};
}
