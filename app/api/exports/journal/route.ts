import {exportJournal} from '@/app/journal/export';
import {exportError,jsonAttachment} from '@/lib/exports/http';

export const dynamic='force-dynamic';
export async function GET(request:Request){
 const fail=(error:string,status:number)=>exportError(error,status,{request,backHref:'/settings',backLabel:'Back to Settings'});
 try{
  const result=await exportJournal();
  if(result.error){
   if(result.error.startsWith('Log in'))return fail('Log in again to export your journal.',401);
   if(result.error.includes('1,000 annotations')||result.error.includes('5 MB'))return fail('Journal export exceeds the current 1,000 annotation or 5 MB limit. No partial file was created.',413);
   return fail('Unable to read your complete journal. Retry; no partial file was created.',503);
  }
  if(!result.data)return fail('Journal export is unavailable. Retry later.',503);
  return jsonAttachment(JSON.parse(result.data),`trademirror-journal-${new Date().toISOString().slice(0,10)}.json`);
 }catch{
  return fail('Unable to prepare your complete journal. No partial file was created.',503);
 }
}
