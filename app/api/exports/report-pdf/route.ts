import {getSignedInUser} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {advancedDemo} from '@/data/advanced-demo';
import {reportSelection,reportSnapshot} from '@/lib/reports/snapshot';
import {readSavedExport} from '@/lib/exports/saved-record';
import {reportPdf} from '@/lib/reports/pdf';
import {exportError} from '@/lib/exports/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const p=new URL(request.url).searchParams,mode=p.get('mode'),date=p.get('date'),demo=p.get('demo'),id=p.get('snapshot');
 const fail=(message:string,status:number)=>exportError(message,status,{request,backHref:demo==='1'?'/demo/reports':'/reports',backLabel:'Back to Reports'});
 try{
  let report,savedAt,filename;
  if(id!==null){
   if(mode!==null||date!==null||demo!==null)return fail('Choose a saved snapshot or a current period, not both.',400);
   const saved=await readSavedExport('snapshot',id);if(!saved.ok)return fail(saved.error,saved.status);if(saved.kind!=='snapshot')return fail('Choose a saved report snapshot.',400);
   report=saved.record.payload;savedAt=saved.record.created_at;filename=`trademirror-snapshot-${saved.record.id.toLowerCase()}.pdf`;
  }else{
   if((mode!=='daily'&&mode!=='weekly')||!date||!/^\d{4}-\d{2}-\d{2}$/.test(date)||(demo!==null&&demo!=='1'))return fail('Choose a valid daily or weekly report period.',400);
   if(demo!=='1'&&!await getSignedInUser())return fail('Log in again to download your report.',401);
   const matches=demo==='1'?advancedDemo.matches:(await getAccountAnalytics()).result.matches;
   const period=reportSelection(matches,mode,date);report={...reportSnapshot(period.rows,mode,period.date),scope:demo==='1'?'synthetic demo':'real imports only'};filename=`trademirror-${demo==='1'?'demo-':''}${mode}-${period.date}.pdf`;
  }
  const bytes=await reportPdf(report,savedAt);
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'}});
 }catch{return fail('Unable to generate this PDF. Refresh your report and retry. No partial file was created.',400);}
}
