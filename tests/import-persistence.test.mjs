import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('CSV transaction isolates owners, deduplicates repeated and overlapping imports, and rolls back conflicts',async()=>{
 const db=new PGlite();const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated;`);
 for(const name of ['202610070001_foundation.sql','202610100001_csv_import.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1,$2),($3,$4)',[a,{},b,{}]);
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 const execution={symbol:'NIFTY',exchange:'NFO',segment:'FO',side:'BUY',quantity:'75',price:'124.50',tradeId:'1',orderId:'10',executedAt:'2026-10-07T09:24:00+05:30'};
 const run=async(records)=> (await db.query('select public.import_zerodha_executions($1,$2::jsonb) as result',['test.csv',JSON.stringify(records)])).rows[0].result;
 assert.equal((await run([execution])).inserted,1);
 assert.equal((await run([execution])).already_imported,true);
 assert.equal((await run([execution,{...execution,tradeId:'2'}])).inserted,1);
 assert.equal((await db.query('select count(*)::int as n from orders')).rows[0].n,2);
 await assert.rejects(run([{...execution,tradeId:'3'},{...execution,price:'999'}]),/Conflicting execution/);
 assert.equal((await db.query('select count(*)::int as n from orders')).rows[0].n,2);
 assert.equal((await db.query('select count(*)::int as n from broker_imports')).rows[0].n,2);
 await assert.rejects(run([{...execution,quantity:'-1'}]),/Invalid execution/);
 await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);`);
 assert.equal((await db.query('select count(*)::int as n from orders')).rows[0].n,0);
 assert.equal((await run([execution])).inserted,1);
 await db.exec("select set_config('request.jwt.claim.sub','',false);");await assert.rejects(run([execution]),/Authentication required/);
 await db.exec('set role anon;');await assert.rejects(run([execution]),/permission denied/);
 }finally{await db.close();}
});
