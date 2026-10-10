import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';
const uri=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const read=async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const annotation=uri(await read('../lib/journal/annotation.ts'));
const {sliceIdentity}=await import(annotation);
const evidence={id:'sample',broker:'ZERODHA',symbol:'SYNTHETIC',side:'LONG',quantity:'1',entryPrice:'1.00',exitPrice:'2.00',entryTime:'2026-10-05T09:30:00+05:30',exitTime:'2026-10-05T09:31:00+05:30',entryId:'a',exitId:'b',grossPnl:'1'};
const key=createHash('sha256').update(sliceIdentity(evidence)).digest('hex');
const row=(slice_key=key,notes='Synthetic note')=>({slice_key,notes,tags:['sample'],checklist:[true],plan_items:['Did I follow my plan?'],revision:1});
const state={user:{id:'owner'},rows:[],plan:{name:'Sample plan',items:['Did I follow my plan?'],revision:1},error:false,queries:0};
globalThis.__tmExportTest=state;
const stub=uri(`import assert from 'node:assert/strict';
export async function getSignedInUser(){return globalThis.__tmExportTest.user;}
export async function getAccountAnalytics(include){assert.equal(include,true);return {result:{matches:${JSON.stringify([evidence])}}};}
export async function createClient(){return {from(table){globalThis.__tmExportTest.queries++;return {select(){return this},eq(column,value){assert.equal(column,'user_id');assert.equal(value,'owner');return this},order(){return this},async range(start,end){return {data:globalThis.__tmExportTest.rows.slice(start,end+1),error:globalThis.__tmExportTest.error}},async maybeSingle(){assert.equal(table,'journal_plan_templates');return {data:globalThis.__tmExportTest.plan,error:globalThis.__tmExportTest.error}}}}};}`);
let source=await read('../app/journal/export.ts');
for(const path of ['@/lib/auth/session','@/lib/supabase/server','@/lib/workspace/analytics'])source=source.replace(`'${path}'`,JSON.stringify(stub));
source=source.replace("'@/lib/journal/annotation'",JSON.stringify(annotation));
const {exportJournal}=await import(uri(source));
test('journal export requires owner auth, preserves exact evidence and retained unlinked notes, and excludes account credentials',async()=>{
 state.user=null;state.queries=0;assert.match((await exportJournal()).error,/Log in/);assert.equal(state.queries,0);
 state.user={id:'owner'};state.rows=[row(),row('unlinked','Retained synthetic note')];const result=await exportJournal();assert.equal(result.error,undefined);const data=JSON.parse(result.data);
 assert.equal(data.format,'trademirror-journal');assert.equal(data.annotations[0].connection,'linked');assert.deepEqual(data.annotations[0].evidence,evidence);assert.equal(data.annotations[1].connection,'unlinked');assert.equal(data.annotations[1].evidence,null);assert.equal(data.annotations[1].notes,'Retained synthetic note');assert.deepEqual(data.plan,state.plan);assert.ok(!result.data.includes('user_id'));assert.ok(!result.data.includes('OPENAI_API_KEY'));
});
test('journal export completes paginated history but fails without partial output at row, byte or source-read limits',async()=>{
 state.rows=Array.from({length:101},(_,i)=>row(String(i)));const paged=JSON.parse((await exportJournal()).data);assert.equal(paged.annotations.length,101);
 state.rows=Array.from({length:1001},(_,i)=>row(String(i)));let result=await exportJournal();assert.match(result.error,/1,000 annotations/);assert.equal(result.data,undefined);
 state.rows=Array.from({length:600},(_,i)=>row(String(i),'x'.repeat(10000)));result=await exportJournal();assert.match(result.error,/5 MB/);assert.equal(result.data,undefined);
 state.rows=[];state.error=true;result=await exportJournal();assert.match(result.error,/Unable to read/);assert.equal(result.data,undefined);state.error=false;
});
