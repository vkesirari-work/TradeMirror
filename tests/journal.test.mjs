import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {PGlite} from '@electric-sql/pglite';
const source=await readFile(new URL('../lib/journal/annotation.ts',import.meta.url),'utf8');
const {sliceIdentity,validateAnnotation}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
test('journal validation normalizes tags and rejects invalid bounded content',()=>{
 assert.deepEqual(validateAnnotation({notes:'exit <script>',tags:['Breakout',' breakout '],checklist:[true,false,true]}),{notes:'exit <script>',tags:['breakout'],checklist:[true,false,true]});
 for(const data of [{notes:'x'.repeat(10001),tags:[],checklist:[true,false,true]},{notes:'',tags:['x'.repeat(41)],checklist:[false,false,false]},{notes:'',tags:[],checklist:[1,false,false]}])assert.throws(()=>validateAnnotation(data));
});
test('slice identity changes with altered matching evidence, not gross formatting',()=>{
 const match={id:'stable',symbol:'NIFTY',side:'LONG',quantity:'65',entryPrice:'100',exitPrice:'110',entryTime:'a',exitTime:'b',grossPnl:'650'};
 assert.equal(sliceIdentity(match),sliceIdentity({...match,grossPnl:'650.0'}));
 for(const key of ['id','quantity','entryPrice','exitPrice','entryTime','exitTime'])assert.notEqual(sliceIdentity(match),sliceIdentity({...match,[key]:'changed'}));
});
test('journal database isolates owners, enforces limits and rejects stale revision updates',async()=>{
 const db=new PGlite();const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222',key='a'.repeat(64);
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/202610100002_journal_annotations.sql',import.meta.url),'utf8'));
 await db.query('insert into auth.users values($1),($2)',[a,b]);
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`);
 await db.query('insert into journal_annotations(user_id,slice_key,notes) values($1,$2,$3)',[a,key,'private']);
 await assert.rejects(db.query('insert into journal_annotations(user_id,slice_key) values($1,$2)',[b,key]),/row-level security/);
 assert.equal((await db.query('update journal_annotations set notes=$1,revision=2 where revision=1 returning revision',['new'])).rows[0].revision,2);
 assert.equal((await db.query('update journal_annotations set notes=$1,revision=2 where revision=1 returning revision',['stale'])).rows.length,0);
 await assert.rejects(db.query('update journal_annotations set notes=$1',['x'.repeat(10001)]),/check constraint/);
 await assert.rejects(db.query('update journal_annotations set tags=$1',[['x'.repeat(41)]]),/check constraint/);
 await assert.rejects(db.query('update journal_annotations set user_id=$1',[b]),/permission denied/);
 await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);`);
 assert.equal((await db.query('select * from journal_annotations')).rows.length,0);
 assert.equal((await db.query('update journal_annotations set notes=$1 returning *',['cross owner'])).rows.length,0);
 await db.exec('set role anon');await assert.rejects(db.query('select * from journal_annotations'),/permission denied/);
 }finally{await db.close();}
});
