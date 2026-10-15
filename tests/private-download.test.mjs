import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const uri=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const read=async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const daily=uri(await read('../lib/analytics/daily.ts'));
const advanced=uri((await read('../lib/analytics/advanced.ts')).replace("'./daily'",JSON.stringify(daily)));
const snapshot=uri((await read('../lib/reports/snapshot.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)));
const statement=uri((await read('../lib/costs/zerodha.ts')).replace("'../analytics/daily'",JSON.stringify(daily)));
const http=uri(await read('../lib/exports/http.ts'));
const {reportSnapshot}=await import(snapshot);
const match={id:'synthetic',broker:'ZERODHA',symbol:'NIFTY',side:'LONG',quantity:'65',entryPrice:'126.85',exitPrice:'127.7',entryTime:'2026-10-05T09:30:00+05:30',exitTime:'2026-10-05T09:31:00+05:30',entryId:'a',exitId:'b',grossPnl:'55.25'};
const payload=reportSnapshot([match],'weekly','2026-10-05');
const id='11111111-1111-4111-8111-111111111111';
const base={id,user_id:'owner-a',created_at:'2026-10-10T12:00:00Z',fingerprint:'a'.repeat(64)};
const state={user:{id:'owner-a'},reads:0,fail:false,client:true,journal:{data:JSON.stringify({format:'trademirror-journal',version:1,annotations:[],plan:null})},tables:{report_snapshots:[{...base,mode:'weekly',period:'2026-10-05',payload}],broker_statements:[{...base,payload:{broker:'ZERODHA',segment:'F&O',start:'2026-10-01',end:'2026-10-31',gross:'10',charges:'2',otherNet:'-1',unrealized:'0',net:'7',chargeItems:[{label:'Sample fee',amount:'2'}],instruments:[{symbol:'NIFTY',gross:'10'}]}}]}};
globalThis.__tmPrivateDownloads=state;
const stub=uri(`import assert from 'node:assert/strict';
export async function getSignedInUser(){return globalThis.__tmPrivateDownloads.user;}
export async function createClient(){
 if(!globalThis.__tmPrivateDownloads.client)return null;
 return {from(table){
  assert.ok(['report_snapshots','broker_statements'].includes(table));
  const filters={};let fields=[];
  return {
   select(columns){assert.ok(!columns.includes('*'));fields=columns.split(',');return this;},
   eq(column,value){filters[column]=value;return this;},
   async maybeSingle(){
    const s=globalThis.__tmPrivateDownloads;s.reads++;
    assert.equal(filters.user_id,s.user.id);assert.ok(filters.id);
    const row=s.tables[table].find(r=>r.user_id===filters.user_id&&r.id===filters.id);
    return {data:row?Object.fromEntries(fields.map(f=>[f,row[f]])):null,error:s.fail?{message:'private backend diagnostic'}:null};
   }
  };
 }};
}
export async function exportJournal(){return globalThis.__tmPrivateDownloads.journal;}`);
let source=await read('../app/api/exports/saved/route.ts');
for(const path of ['@/lib/auth/session','@/lib/supabase/server'])source=source.replace(`'${path}'`,JSON.stringify(stub));
source=source.replace("'@/lib/reports/snapshot'",JSON.stringify(snapshot)).replace("'@/lib/costs/zerodha'",JSON.stringify(statement)).replace("'@/lib/exports/http'",JSON.stringify(http));
const {GET:saved}=await import(uri(source));
let journalSource=await read('../app/api/exports/journal/route.ts');journalSource=journalSource.replace("'@/app/journal/export'",JSON.stringify(stub)).replace("'@/lib/exports/http'",JSON.stringify(http));
const {GET:journal}=await import(uri(journalSource));
const request=(kind='snapshot',value=id)=>new Request('https://example.test/api/exports/saved?'+new URLSearchParams({kind,id:value}));
const noFile=async(response,status)=>{assert.equal(response.status,status);assert.equal(response.headers.get('content-disposition'),null);assert.match(response.headers.get('cache-control'),/no-store/);assert.ok(!(await response.text()).includes('private backend diagnostic'));};
test('saved private downloads validate selection and authenticate before database reads',async()=>{
 state.user=null;state.reads=0;await noFile(await saved(request()),401);assert.equal(state.reads,0);
 for(const req of [request('orders'),request('snapshot','../owner'),request('statement',id+'\r\ninject')])await noFile(await saved(req),400);
 assert.equal(state.reads,0);state.user={id:'owner-a'};
});
test('saved snapshot attachment keeps frozen payload and timestamps; another owner and missing record are indistinguishable',async()=>{
 state.user={id:'owner-a'};const response=await saved(request());assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/json; charset=utf-8');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('content-disposition'),`attachment; filename="trademirror-snapshot-${id}.json"`);
 const data=await response.json();assert.deepEqual(data.payload,payload);assert.equal(data.created_at,base.created_at);assert.ok(!('user_id' in data));
 state.user={id:'owner-b'};for(const kind of ['snapshot','statement']){const other=await saved(request(kind));const missing=await saved(request(kind,'33333333-3333-4333-8333-333333333333'));assert.equal(other.status,404);assert.equal(missing.status,404);assert.equal(await other.text(),await missing.text());assert.equal(other.headers.get('content-disposition'),null);}state.user={id:'owner-a'};
});
test('saved broker statements export exact parsed amounts without raw workbooks or account identifiers',async()=>{
 const response=await saved(request('statement'));assert.equal(response.status,200);const data=await response.json();assert.equal(data.payload.net,'7');assert.equal(data.payload.otherNet,'-1');assert.equal(data.payload.unrealized,'0');assert.ok(!('user_id' in data));assert.ok(!('file' in data));assert.match(response.headers.get('content-disposition'),/trademirror-statement-/);
});
test('malformed saved evidence and read failures return safe errors without partial files',async()=>{
 state.fail=true;await noFile(await saved(request()),503);state.fail=false;
 state.client=false;await noFile(await saved(request()),503);state.client=true;
 const row=state.tables.report_snapshots[0];row.period='2026-10-06';await noFile(await saved(request()),422);row.period='2026-10-05';
 const original=state.tables.broker_statements[0].payload;state.tables.broker_statements[0].payload={...original,net:'999'};await noFile(await saved(request('statement')),422);state.tables.broker_statements[0].payload=original;
});
test('journal route returns bounded complete JSON attachments and maps auth, size, read and malformed-data failures without attachments',async()=>{
 let response=await journal();assert.equal(response.status,200);assert.match(response.headers.get('content-disposition'),/attachment; filename="trademirror-journal-\d{4}-\d{2}-\d{2}\.json"/);assert.equal((await response.json()).format,'trademirror-journal');
 for(const [error,status] of [['Log in again to export your journal.',401],['Journal export supports up to 1,000 annotations.',413],['Journal export exceeds the 5 MB limit.',413],['private backend diagnostic',503]]){state.journal={error};await noFile(await journal(),status);}
 state.journal={data:'malformed JSON'};await noFile(await journal(),503);state.journal={};await noFile(await journal(),503);
});
