import {getSignedInUser} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {advancedDemo} from '@/data/advanced-demo';
import {reportSelection,reportSnapshot} from '@/lib/reports/snapshot';
import {exportMatchedCsv} from '@/lib/analytics/export';

export const dynamic='force-dynamic';
const privateHeaders={'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const mode=params.get('mode'),date=params.get('date'),format=params.get('format'),demo=params.get('demo');
 if((mode!=='daily'&&mode!=='weekly')||!date||!/^\d{4}-\d{2}-\d{2}$/.test(date)||(format!=='json'&&format!=='csv')||(demo!==null&&demo!=='1'))return Response.json({error:'Choose a valid report period and JSON or CSV format.'},{status:400,headers:privateHeaders});
 try{
  // Public exports select only the independent synthetic fixture. Account exports
  // require a validated session and rebuild owner-scoped evidence on the server.
  if(demo!=='1'&&!await getSignedInUser())return Response.json({error:'Log in again to download your report.'},{status:401,headers:privateHeaders});
  const matches=demo==='1'?advancedDemo.matches:(await getAccountAnalytics()).result.matches;
  const period=reportSelection(matches,mode,date);
  const body=format==='csv'?exportMatchedCsv(period.rows):JSON.stringify({...reportSnapshot(period.rows,mode,period.date),scope:demo==='1'?'synthetic demo':'real imports only',exportedAt:new Date().toISOString()},null,2);
  return new Response(body,{headers:{...privateHeaders,'Content-Type':format==='csv'?'text/csv; charset=utf-8':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="trademirror-${demo==='1'?'demo-':''}${mode}-${period.date}.${format}"`}});
 }catch{
  return Response.json({error:'Unable to export this period. Refresh your report and retry; your history may have changed.'},{status:400,headers:privateHeaders});
 }
}
