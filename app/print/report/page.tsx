import {redirect} from 'next/navigation';
import {getSignedInUser} from '@/lib/auth/session';
import {getAccountAnalytics} from '@/lib/workspace/analytics';
import {advancedDemo} from '@/data/advanced-demo';
import {readSavedExport} from '@/lib/exports/saved-record';
import {currentPrintReport,frozenPrintReport} from '@/lib/reports/print-model';
import {PrintableReport,PrintUnavailable} from '@/components/reports/print-report';
export const dynamic='force-dynamic';
export const metadata={title:'Printable trading review',robots:{index:false,follow:false}};
export default async function PrintReport({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;const backHref=params.demo==='1'?'/demo/reports':'/reports';
 if(params.snapshot!==undefined){
  if(params.demo!==undefined||params.mode!==undefined||params.date!==undefined)return <PrintUnavailable backHref={backHref} message="Choose a saved snapshot or a current report, not both."/>;
  const result=await readSavedExport('snapshot',params.snapshot);
  if(!result.ok){if(result.status===401)redirect('/login');return <PrintUnavailable backHref={backHref} message={result.error}/>;}
  if(result.kind!=='snapshot')return <PrintUnavailable backHref={backHref} message="Choose a saved report snapshot."/>;
  let frozen;try{frozen=frozenPrintReport(result.record.payload);}catch{return <PrintUnavailable backHref={backHref} message="Saved snapshot evidence is inconsistent. No printable report was created."/>;}
  return <PrintableReport report={frozen} savedAt={result.record.created_at} backHref={backHref}/>;
 }
 if((params.demo!==undefined&&params.demo!=='1')||(params.mode!=='daily'&&params.mode!=='weekly')||typeof params.date!=='string')return <PrintUnavailable backHref={backHref} message="Choose a valid daily or weekly report period."/>;
 if(params.demo!=='1'&&!await getSignedInUser())redirect('/login');
 let report;
 try{const matches=params.demo==='1'?advancedDemo.matches:(await getAccountAnalytics()).result.matches;report=currentPrintReport(matches,params.mode,params.date,params.demo==='1');}catch{return <PrintUnavailable backHref={backHref} message="This report cannot be generated. Refresh Reports and choose an available period."/>;}
 return <PrintableReport report={report} backHref={backHref}/>;
}
