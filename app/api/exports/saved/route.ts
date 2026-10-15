import {readSavedExport} from '@/lib/exports/saved-record';
import {exportError,jsonAttachment} from '@/lib/exports/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const result=await readSavedExport(params.get('kind'),params.get('id'));
 if(!result.ok)return exportError(result.error,result.status,{request,backHref:params.get('kind')==='statement'?'/costs':'/reports',backLabel:params.get('kind')==='statement'?'Back to Costs':'Back to Reports'});
 return jsonAttachment(result.record,`trademirror-${result.kind}-${result.record.id.toLowerCase()}.json`);
}
