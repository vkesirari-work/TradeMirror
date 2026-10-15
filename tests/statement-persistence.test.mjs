import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {PGlite} from '@electric-sql/pglite';
import {workbook} from './helpers/xlsx.mjs';
const uri=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const read=async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const daily=uri(await read('../lib/analytics/daily.ts'));
const costs=uri((await read('../lib/costs/zerodha.ts')).replace("'../analytics/daily'",JSON.stringify(daily)));
const xlsx=uri((await read('../lib/costs/xlsx.ts')).replace("'fast-xml-parser'",JSON.stringify(import.meta.resolve('fast-xml-parser'))));
const state={user:null,client:null};globalThis.__tmStatementPersistence=state;
const stub=uri('export async function getSignedInUser(){return globalThis.__tmStatementPersistence.user;}export async function createClient(){return globalThis.__tmStatementPersistence.client;}');
let source=await read('../app/costs/actions.ts');for(const path of ['@/lib/auth/session','@/lib/supabase/server'])source=source.replace(`'${path}'`,JSON.stringify(stub));source=source.replace("'@/lib/costs/zerodha'",JSON.stringify(costs)).replace("'@/lib/costs/xlsx'",JSON.stringify(xlsx));
const {previewStatement,saveStatement,loadStatements}=await import(uri(source));
const sheets=()=>new Map([['F&O',[{B:'P&L Statement for F&O from 2026-10-01 to 2026-10-31'},{B:'Charges',C:'2.0001'},{B:'Other Credit & Debit',C:'-1'},{B:'Realized P&L',C:'10'},{B:'Unrealized P&L',C:'4'},{B:'Account Head',C:'Amount'},{B:'Brokerage',C:'2.0001'},{B:'Symbol',G:'Realized P&L'},{B:'NIFTY',G:'10'}]],['Other Debits and Credits',[{B:'Other Debits and Credits for FO from 2026-10-01 to 2026-10-31'},{B:'Particulars',C:'Posting Date',D:'Debit',E:'Credit'},{B:'Synthetic fee',C:'2026-10-05',D:'1',E:'0'}]]]);
const form=(bytes=workbook(sheets()),confirmed=true,name='synthetic-statement.xlsx')=>{const f=new FormData();f.set('file',new File([bytes],name));if(confirmed)f.set('confirmed','yes');return f;};

test('statement server actions preview, save, deduplicate and reload synthetic XLSX through PostgreSQL owner policies',async()=>{
 const db=new PGlite();const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 try{
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to authenticated;`);
  await db.exec(await readFile(new URL('../supabase/migrations/202610100004_report_snapshots.sql',import.meta.url),'utf8'));await db.query('insert into auth.users values($1),($2)',[a,b]);
  const asOwner=async id=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');state.user={id};};
  // Minimal Supabase-shaped adapter; all persistence and ownership enforcement
  // execute against the actual migration in PostgreSQL, not an in-memory map.
  state.client={from(table){assert.equal(table,'broker_statements');let inserted=null;const filters={};return {
   insert(value){inserted=value;return this;},select(columns){assert.equal(columns,'id,created_at,fingerprint,payload');return this;},eq(key,value){assert.ok(['user_id','fingerprint'].includes(key));filters[key]=value;return this;},order(key,{ascending}){assert.ok(['created_at','id'].includes(key));assert.equal(ascending,false);return this;},
   async single(){try{let result;if(inserted)result=await db.query('insert into broker_statements(user_id,fingerprint,payload) values($1,$2,$3::jsonb) returning id,created_at,fingerprint,payload',[inserted.user_id,inserted.fingerprint,JSON.stringify(inserted.payload)]);else result=await db.query('select id,created_at,fingerprint,payload from broker_statements where user_id=$1 and fingerprint=$2',[filters.user_id,filters.fingerprint]);return {data:JSON.parse(JSON.stringify(result.rows[0])),error:null};}catch(error){return {data:null,error:{code:error.code}};}},
   async limit(max){assert.equal(max,20);assert.equal(filters.user_id,state.user.id);const result=await db.query('select id,created_at,fingerprint,payload from broker_statements where user_id=$1 order by created_at desc,id desc limit $2',[filters.user_id,max]);return {data:JSON.parse(JSON.stringify(result.rows)),error:null};}
  };}};
  assert.match((await saveStatement(form())).error,/Log in/);await asOwner(a);
  const preview=await previewStatement(form());assert.equal(preview.error,undefined);assert.equal(preview.data.net,'6.9999');assert.equal(preview.data.unrealized,'4');assert.equal((await loadStatements()).data.length,0);
  assert.match((await saveStatement(form(undefined,false))).error,/Confirm/);assert.equal((await loadStatements()).data.length,0);
  const first=await saveStatement(form());assert.equal(first.error,undefined);assert.equal(first.data.payload.net,'6.9999');const repeated=await saveStatement(form());assert.equal(repeated.error,undefined);assert.equal(repeated.data.id,first.data.id);assert.equal(repeated.data.created_at,first.data.created_at);
  assert.deepEqual((await loadStatements()).data,[first.data]);
  await asOwner(b);assert.equal((await loadStatements()).data.length,0);const second=await saveStatement(form());assert.equal(second.error,undefined);assert.notEqual(second.data.id,first.data.id);assert.equal((await loadStatements()).data.length,1);
  await asOwner(a);assert.deepEqual((await loadStatements()).data,[first.data]);
  for(const bad of [form(Buffer.from('not a workbook')),form(undefined,true,'wrong.csv'),form(Buffer.alloc(5*1024*1024+1))])assert.ok((await saveStatement(bad)).error);
  const mismatch=sheets();mismatch.get('F&O')[1].C='3';assert.ok((await saveStatement(form(workbook(mismatch)))).error);assert.deepEqual((await loadStatements()).data,[first.data]);
  state.user=null;assert.match((await previewStatement(form())).error,/Log in/);assert.match((await loadStatements()).error,/Log in/);
  await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from broker_statements')).rows[0].n,2);
 }finally{await db.close();delete globalThis.__tmStatementPersistence;}
});
