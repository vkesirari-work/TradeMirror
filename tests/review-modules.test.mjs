import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {stripTypeScriptTypes} from 'node:module';import {PGlite} from '@electric-sql/pglite';
const source=await readFile(new URL('../lib/journal/risk.ts',import.meta.url),'utf8');const {validateRisk}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
test('risk inputs distinguish unavailable from zero and preserve exact decimals without inferring risk',()=>{assert.deepEqual(validateRisk({stop:'',target:'0',budget:'100.12345678'}),{stop:'',target:'0',budget:'100.12345678'});for(const stop of ['-1','1e3','NaN','01','1.123456789','1000000000000',null])assert.throws(()=>validateRisk({stop,target:'',budget:''}));});
test('review module migration isolates template/risk owners, enforces decimal/schema limits and stale revisions',async()=>{
 const db=new PGlite(),a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',key='a'.repeat(64);
 try{await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated;`);
 for(const name of ['202610100002_journal_annotations.sql','202610100003_journal_plans.sql','202610150001_review_modules.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+name,import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1),($2)',[a,b]);await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${a}',false)`);
 const row=(await db.query('insert into journal_playbooks(user_id,name,items) values($1,$2,$3) returning id',[a,'Breakout',['Wait','Risk defined']])).rows[0];
 await db.query('insert into journal_playbooks(user_id,name,items) values($1,$2,$3)',[a,'Reversal',['Wait']]);assert.equal((await db.query('select * from journal_playbooks')).rows.length,2);
 await db.query('insert into journal_risk_inputs(user_id,slice_key,stop,target,budget) values($1,$2,$3,$4,$5)',[a,key,'','0','100.12345678']);assert.equal((await db.query('select budget from journal_risk_inputs')).rows[0].budget,'100.12345678');
 await assert.rejects(db.query('insert into journal_risk_inputs(user_id,slice_key) values($1,$2)',[b,key]),/row-level security/);
 await assert.rejects(db.query('update journal_risk_inputs set budget=$1',['-1']),/check constraint/);
 await assert.rejects(db.query('update journal_playbooks set items=$1',[['Risk',' risk ']]),/check constraint/);
 await db.query('update journal_playbooks set revision=2 where id=$1 and revision=1',[row.id]);assert.equal((await db.query('update journal_playbooks set name=$1 where id=$2 and revision=1 returning *',['Stale',row.id])).rows.length,0);
 await assert.rejects(db.query('update journal_playbooks set user_id=$1',[b]),/permission denied/);
 await db.exec(`select set_config('request.jwt.claim.sub','${b}',false)`);assert.equal((await db.query('select * from journal_playbooks')).rows.length,0);assert.equal((await db.query('select * from journal_risk_inputs')).rows.length,0);await db.exec('set role anon');await assert.rejects(db.query('select * from journal_risk_inputs'),/permission denied/);
 }finally{await db.close();}
});
