import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const uri=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const read=async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const daily=uri(await read('../lib/analytics/daily.ts'));
const advanced=uri((await read('../lib/analytics/advanced.ts')).replace("'./daily'",JSON.stringify(daily)));
const snapshot=uri((await read('../lib/reports/snapshot.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)));
const csv=uri(await read('../lib/analytics/export.ts'));
const fill={id:'sample',broker:'ZERODHA',symbol:'=SYNTHETIC',side:'LONG',quantity:'65',entryPrice:'126.8500',exitPrice:'127.7000',entryTime:'2026-10-05T09:30:00+05:30',exitTime:'2026-10-05T09:31:00+05:30',entryId:'entry',exitId:'exit',grossPnl:'55.25'};
const state={user:null,reads:0,fail:false};globalThis.__tmDownloadTest=state;
const stub=uri(`export async function getSignedInUser(){return globalThis.__tmDownloadTest.user;}export async function getAccountAnalytics(){globalThis.__tmDownloadTest.reads++;if(globalThis.__tmDownloadTest.fail)throw new Error('private backend diagnostic');return {result:{matches:[${JSON.stringify({...fill,grossPnl:'-10'})}]}};}export const advancedDemo={matches:[${JSON.stringify(fill)}]};`);
let source=await read('../app/api/exports/report/route.ts');
for(const path of ['@/lib/auth/session','@/lib/workspace/analytics','@/data/advanced-demo'])source=source.replace(`'${path}'`,JSON.stringify(stub));
source=source.replace("'@/lib/reports/snapshot'",JSON.stringify(snapshot)).replace("'@/lib/analytics/export'",JSON.stringify(csv));
const {GET}=await import(uri(source));
const request=(query='')=>new Request('https://example.test/api/exports/report?mode=weekly&date=2026-10-05&format=json'+query);
test('direct report downloads require account auth; public demo never loads owner evidence',async()=>{
 state.user=null;state.reads=0;let r=await GET(request());assert.equal(r.status,401);assert.equal(state.reads,0);assert.equal(r.headers.get('content-disposition'),null);
 r=await GET(request('&demo=1'));assert.equal(r.status,200);assert.equal(state.reads,0);assert.equal(r.headers.get('cache-control'),'private, no-store, max-age=0');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.match(r.headers.get('content-disposition'),/^attachment; filename="trademirror-demo-weekly-2026-10-05.json"$/);
 const body=await r.json();assert.equal(body.scope,'synthetic demo');assert.equal(body.summary.grossPnl,'55.25');assert.equal(body.summary.slices,1);
 state.user={id:'owner'};r=await GET(request());assert.equal(state.reads,1);assert.equal((await r.json()).summary.grossPnl,'-10');
});
test('CSV file responses retain exact decimals and formula protection; bad selections and backend failures return no partial attachment',async()=>{
 let r=await GET(new Request('https://example.test/api/exports/report?mode=daily&date=2026-10-05&format=csv&demo=1'));assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/csv/);const text=await r.text();assert.ok(text.includes('"126.8500"'));assert.ok(text.includes('"\'=SYNTHETIC"'));assert.ok(text.includes('"55.25"'));
 for(const query of ['mode=monthly&date=2026-10-05&format=json','mode=daily&date=2026-02-30&format=json&demo=1','mode=daily&date=2026-10-05&format=exe','mode=daily&date=2026-10-05&format=json&demo=2','mode=daily&date=2026-10-05%0D%0Ainjection&format=json']){r=await GET(new Request('https://example.test/api/exports/report?'+query));assert.equal(r.status,400);assert.equal(r.headers.get('content-disposition'),null);}
 state.fail=true;state.user={id:'owner'};r=await GET(request());assert.equal(r.status,400);assert.ok(!(await r.text()).includes('private backend diagnostic'));state.fail=false;
});
