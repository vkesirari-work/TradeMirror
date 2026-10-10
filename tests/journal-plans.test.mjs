import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {PGlite} from '@electric-sql/pglite';
const load=async path=>import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(await readFile(new URL(path,import.meta.url),'utf8'))).toString('base64'));
const {validatePlan}=await load('../lib/journal/plan.ts');
const {validateAnnotation,sliceIdentity,matchesJournalTag}=await load('../lib/journal/annotation.ts');
test('custom plans reject empty, duplicate and oversized questions; annotations freeze question/answer pairs',()=>{
 assert.deepEqual(validatePlan({name:'  Opening setup ',items:[' Wait for confirmation ','Size within risk']}),{name:'Opening setup',items:['Wait for confirmation','Size within risk']});
 for(const items of [[],[''],['Risk',' risk '],['x'.repeat(121)],Array(9).fill('risk')])assert.throws(()=>validatePlan({name:'Plan',items}));
 assert.throws(()=>validatePlan({name:' ',items:['Risk']}));
 assert.deepEqual(validateAnnotation({notes:'',tags:[],plan_items:['Signal confirmed'],checklist:[true]}).plan_items,['Signal confirmed']);
 assert.throws(()=>validateAnnotation({notes:'',tags:[],plan_items:['Signal confirmed'],checklist:[true,false]}));
});
test('journal tags select exact evidence, preserve untagged matches and support reserved-looking tag names',()=>{
 const a={id:'a',symbol:'NIFTY',side:'LONG',quantity:'65',entryPrice:'100',exitPrice:'110',entryTime:'a',exitTime:'b'};
 const b={...a,id:'b'},changed={...a,quantity:'30'};const tags={[sliceIdentity(a)]:['breakout','without-tags']};
 assert.deepEqual([a,b,changed].filter(m=>matchesJournalTag(m,tags,'tag:breakout')),[a]);
 assert.deepEqual([a,b,changed].filter(m=>matchesJournalTag(m,tags,'without-tags')),[b,changed]);
 assert.equal(matchesJournalTag(a,tags,'tag:without-tags'),true);
});
test('plan migration preserves old questions, isolates owners and enforces dynamic answer length and revision checks',async()=>{
 const db=new PGlite();const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',key='a'.repeat(64);
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/202610100002_journal_annotations.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1),($2)',[a,b]);await db.query('insert into journal_annotations(user_id,slice_key) values($1,$2)',[a,key]);
 await db.exec(await readFile(new URL('../supabase/migrations/202610100003_journal_plans.sql',import.meta.url),'utf8'));
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 assert.equal((await db.query('select plan_items,checklist from journal_annotations')).rows[0].plan_items.length,3);
 await db.query('insert into journal_plan_templates(user_id,name,items) values($1,$2,$3)',[a,'My plan',['Signal confirmed','Risk capped']]);
 await assert.rejects(db.query('insert into journal_plan_templates(user_id,name,items) values($1,$2,$3)',[b,'Other',['Risk']]),/row-level security/);
 await db.query('update journal_annotations set plan_items=$1,checklist=$2',[['Signal confirmed','Risk capped'],[true,false]]);
 await db.query('update journal_plan_templates set items=$1,revision=2 where revision=1',[['Exit plan']]);
 assert.deepEqual((await db.query('select plan_items from journal_annotations')).rows[0].plan_items,['Signal confirmed','Risk capped']);
 assert.equal((await db.query('update journal_plan_templates set name=$1 where revision=1 returning *',['stale'])).rows.length,0);
 await assert.rejects(db.query('update journal_annotations set checklist=$1',[[true]]),/check constraint/);
 await assert.rejects(db.query('update journal_plan_templates set items=$1',[['Risk',' risk ']]),/check constraint/);
 await assert.rejects(db.query('update journal_plan_templates set user_id=$1',[b]),/permission denied/);
 await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);`);assert.equal((await db.query('select * from journal_plan_templates')).rows.length,0);assert.equal((await db.query('update journal_plan_templates set name=$1 returning *',['cross owner'])).rows.length,0);
 await db.exec('set role anon');await assert.rejects(db.query('select * from journal_plan_templates'),/permission denied/);
 }finally{await db.close();}
});
