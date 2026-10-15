import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const data=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const uri=source=>data(stripTypeScriptTypes(source));
const read=async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const daily=uri(await read('../lib/analytics/daily.ts'));
const advanced=uri((await read('../lib/analytics/advanced.ts')).replace("'./daily'",JSON.stringify(daily)));
const snapshot=uri((await read('../lib/reports/snapshot.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)).replace("'../analytics/daily'",JSON.stringify(daily)));
const {reportSnapshot,validateSnapshot}=await import(snapshot);
const {currentPrintReport,frozenPrintReport}=await import(uri((await read('../lib/reports/print-model.ts')).replace("'./snapshot'",JSON.stringify(snapshot))));
const {exportError}=await import(uri(await read('../lib/exports/http.ts')));
const match=(id,date,pnl)=>({id,broker:'ZERODHA',symbol:'SYNTHETIC',side:'LONG',quantity:'1',entryPrice:'1',exitPrice:'2',entryTime:date+'T09:30:00+05:30',exitTime:date+'T09:31:00+05:30',entryId:'a',exitId:'b',grossPnl:pnl});
const rows=[match('a','2026-10-05','10.00000001'),match('b','2026-10-06','-3')];
const tsx=source=>data(ts.transpileModule(source.replaceAll("'react'",JSON.stringify(import.meta.resolve('react'))),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText.replaceAll('"react/jsx-runtime"',JSON.stringify(import.meta.resolve('react/jsx-runtime'))));
const controls=tsx(await read('../components/reports/print-controls.tsx'));
const format=uri(await read('../lib/analytics/format.ts'));
const view=tsx((await read('../components/reports/print-report.tsx')).replace("'@/lib/analytics/format'",JSON.stringify(format)).replace("'./print-controls'",JSON.stringify(controls)));
const {PrintableReport,PrintUnavailable}=await import(view);

test('current and frozen print models preserve exact selected evidence and never relabel demo values as account snapshots',()=>{
 const current=currentPrintReport(rows,'weekly','2026-10-05',true);assert.equal(current.scope,'synthetic demo');assert.equal(current.summary.grossPnl,'7.00000001');assert.throws(()=>frozenPrintReport(current));
 const saved=reportSnapshot(rows,'weekly','2026-10-05');const frozen=frozenPrintReport(saved);const next=currentPrintReport([...rows,match('c','2026-10-07','20')],'weekly','2026-10-05',false);assert.equal(next.summary.grossPnl,'27.00000001');assert.equal(frozen.summary.grossPnl,'7.00000001');
 assert.equal(currentPrintReport(rows,'daily','2026-10-05',false).summary.slices,1);assert.throws(()=>currentPrintReport(rows,'weekly','2026-10-06',true));
});
test('snapshot integrity rejects mismatched days, counts, cumulative values, ratios and impossible periods',()=>{
 const original=reportSnapshot(rows,'weekly','2026-10-05');
 const variants=[v=>v.summary.days[0].grossPnl='999',v=>v.summary.days[1].cumulativeGross='0',v=>v.summary.days[0].slices=8,v=>v.summary.days[1].date='2026-10-12',v=>v.summary.days[1].date=v.summary.days[0].date,v=>v.period='2026-02-30',v=>v.period='2026-10-06',v=>v.mode='daily',v=>v.summary.winRate='99.0',v=>v.summary.profitFactor='99.00',v=>v.summary.grossProfit='-10',v=>v.summary.maxDrawdown='999',v=>v.scope='unknown'];
 for(const edit of variants){const value=structuredClone(original);edit(value);assert.throws(()=>validateSnapshot(value));}
 assert.deepEqual(validateSnapshot(structuredClone(original)),original);
});
test('print view renders selected-period daily evidence and source limits, with no account identifiers or full report history',()=>{
 const report=currentPrintReport(rows,'weekly','2026-10-05',true);const html=renderToStaticMarkup(createElement(PrintableReport,{report,backHref:'/demo/reports'}));
 for(const text of ['Weekly trading review','SYNTHETIC DEMO','₹7.00000001','2026-10-05','2026-10-06','Net P&amp;L is unavailable','Print / Save PDF'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('Daily history'));assert.ok(!html.includes('entryId'));assert.ok(!html.includes('user_id'));assert.ok(!html.includes('Generate AI'));
 const frozen=renderToStaticMarkup(createElement(PrintableReport,{report:frozenPrintReport(reportSnapshot(rows,'weekly','2026-10-05')),savedAt:'2026-10-10T12:00:00Z',backHref:'/reports'}));assert.ok(frozen.includes('Frozen saved snapshot'));assert.ok(frozen.includes('Values remain frozen'));
 const unavailable=renderToStaticMarkup(createElement(PrintUnavailable,{message:'<script>bad</script>',backHref:'/reports'}));assert.ok(!unavailable.includes('<script>'));assert.ok(unavailable.includes('Report unavailable'));assert.ok(!unavailable.includes('Print / Save PDF'));
});
test('browser HTML export failures escape content, preserve status, and provide retry/back actions while API errors stay JSON',async()=>{
 const request=new Request('https://example.test/api/exports/report?date=%22%3E%3Cscript%3E',{headers:{accept:'text/html'}});
 const response=exportError('<script>alert(1)</script>',400,{request,backHref:'/reports',backLabel:'Back to Reports'});assert.equal(response.status,400);assert.equal(response.headers.get('content-disposition'),null);assert.match(response.headers.get('content-security-policy'),/default-src 'none'/);assert.match(response.headers.get('cache-control'),/no-store/);const html=await response.text();assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Retry download'));assert.ok(html.includes('Back to Reports'));
 const api=exportError('Unavailable',503);assert.deepEqual(await api.json(),{error:'Unavailable'});assert.equal(api.status,503);
});
test('download controls retain native attachment links and provide honest receipt guidance',async()=>{
 const feedback=uri(await read('../lib/exports/feedback.ts'));const {downloadRequested}=await import(feedback);assert.ok(downloadRequested.includes('requested'));assert.ok(!downloadRequested.includes('saved successfully'));
 const {DownloadLink}=await import(tsx((await read('../components/download-link.tsx')).replace("'@/lib/exports/feedback'",JSON.stringify(feedback))));const html=renderToStaticMarkup(createElement(DownloadLink,{href:'/api/exports/journal'},'Download journal JSON'));assert.ok(html.includes('href="/api/exports/journal"'));assert.ok(html.includes('Download journal JSON'));assert.ok(!html.includes('blob:'));
});
