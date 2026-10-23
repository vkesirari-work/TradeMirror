import {zip} from './helpers/xlsx.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {PGlite} from '@electric-sql/pglite';
const uri=s=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(s)).toString('base64');
const read=async p=>(await readFile(new URL(p,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const daily=uri(await read('../lib/analytics/daily.ts'));
const advanced=uri((await read('../lib/analytics/advanced.ts')).replace("'./daily'",JSON.stringify(daily)));
const {reviewRange}=await import(uri((await read('../lib/journal/range.ts')).replace("'../analytics/daily'",JSON.stringify(daily))));
const {reportSelection,reportSnapshot,validateSnapshot}=await import(uri((await read('../lib/reports/snapshot.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)).replace("'../analytics/daily'",JSON.stringify(daily))));
const {reviewEvidence,responseReview,validateAiReview}=await import(uri((await read('../lib/reports/ai.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)).replace("'../analytics/daily'",JSON.stringify(daily))));
const match=(id,time,pnl)=>({id,broker:'ZERODHA',symbol:'NIFTY',side:'LONG',quantity:'1',entryPrice:'100',exitPrice:'101',entryTime:'2026-10-05T09:00:00+05:30',exitTime:time,entryId:'entry',exitId:'exit',grossPnl:pnl});
const rows=[match('a','2026-10-05T18:45:00Z','99999999999999.99'),match('b','2026-10-07T10:00:00+05:30','-99999999999999.98')];
test('review ranges use IST boundaries and reject impossible or reversed dates without showing partial results',()=>{
 assert.deepEqual(reviewRange(rows,'2026-10-06','2026-10-06').matches,[rows[0]]);
 for(const range of [['2026-02-30',''],['2026-10-08','2026-10-05'],[['2026-10-05'],'']]){const r=reviewRange(rows,...range);assert.ok(r.error);assert.equal(r.matches.length,0);}
 assert.equal(reviewRange(rows).matches.length,2);
});
test('period snapshots freeze exact summary values and daily evidence without depending on later history',()=>{
 const p=reportSelection(rows,'weekly','2026-10-05');const snapshot=reportSnapshot(p.rows,'weekly',p.date);
 assert.equal(snapshot.summary.grossPnl,'0.01');assert.equal(snapshot.summary.days[0].date,'2026-10-06');assert.deepEqual(validateSnapshot(JSON.parse(JSON.stringify(snapshot))),snapshot);
 assert.throws(()=>reportSelection(rows,'daily','2026-10-05'));assert.throws(()=>reportSelection(rows,'monthly','2026-10-05'));
 assert.throws(()=>validateSnapshot({...snapshot,summary:{...snapshot.summary,grossPnl:0.01}}));assert.throws(()=>validateSnapshot({...snapshot,summary:{...snapshot.summary,slices:9}}));
 const newer=reportSnapshot([...rows,match('c','2026-10-08T10:00:00+05:30','10')],'weekly',p.date);assert.equal(newer.summary.grossPnl,'10.01');assert.equal(snapshot.summary.grossPnl,'0.01');
});
test('AI evidence omits identities and accepts only complete bounded observations referencing known facts',()=>{
 const evidence=JSON.stringify(reviewEvidence(rows));for(const forbidden of ['entryId','exitId','NIFTY','entryPrice'])assert.ok(!evidence.includes(forbidden));
 const observations=Array.from({length:3},()=>({evidence_id:'results',reflection:'Results vary.',question:'Which entries followed your plan?'}));
 assert.deepEqual(responseReview({status:'completed',output:[{type:'reasoning'},{type:'message',content:[{type:'output_text',text:JSON.stringify({observations})}]}]}),{observations});
 assert.throws(()=>responseReview({status:'incomplete',output:[]}));assert.throws(()=>validateAiReview({observations:[{...observations[0],evidence_id:'invented'},...observations.slice(1)]}));assert.throws(()=>validateAiReview({observations:observations.slice(1)}));
});
test('snapshot storage isolates owners, prevents edits, deduplicates evidence and enforces atomic AI quotas',async()=>{
 const db=new PGlite();const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';const payload=reportSnapshot(rows,'weekly','2026-10-05');
 try{await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to anon,authenticated;grant execute on function auth.uid() to authenticated;`);
 await db.exec(await readFile(new URL('../supabase/migrations/202610100004_report_snapshots.sql',import.meta.url),'utf8'));await db.query('insert into auth.users values($1),($2)',[a,b]);
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${a}',false)`);
 await db.query('insert into report_snapshots(user_id,mode,period,fingerprint,payload) values($1,$2,$3,$4,$5)',[a,'weekly','2026-10-05','a'.repeat(64),payload]);
 await assert.rejects(db.query('insert into report_snapshots(user_id,mode,period,fingerprint,payload) values($1,$2,$3,$4,$5)',[a,'weekly','2026-10-05','a'.repeat(64),payload]),/unique constraint/);
 await assert.rejects(db.query('insert into report_snapshots(user_id,mode,period,fingerprint,payload) values($1,$2,$3,$4,$5)',[b,'weekly','2026-10-05','b'.repeat(64),payload]),/row-level security/);
 await assert.rejects(db.query('update report_snapshots set payload=$1',[payload]),/permission denied/);await assert.rejects(db.query('delete from report_snapshots'),/permission denied/);
 assert.equal((await db.query('select reserve_ai_review() allowed')).rows[0].allowed,true);assert.equal((await db.query('select reserve_ai_review() allowed')).rows[0].allowed,false);await assert.rejects(db.query('select * from ai_review_usage'),/permission denied/);
 await db.exec('reset role');await db.query("update ai_review_usage set attempts=5,last_requested_at=now()-interval '2 minutes' where user_id=$1",[a]);await db.exec('set role authenticated');assert.equal((await db.query('select reserve_ai_review() allowed')).rows[0].allowed,false);
 await db.exec(`select set_config('request.jwt.claim.sub','${b}',false)`);assert.equal((await db.query('select * from report_snapshots')).rows.length,0);assert.equal((await db.query('select reserve_ai_review() allowed')).rows[0].allowed,true);
 await db.query('insert into broker_statements(user_id,fingerprint,payload) values($1,$2,$3)',[b,'b'.repeat(64),parseZerodhaStatement(sheet())]);await assert.rejects(db.query('insert into broker_statements(user_id,fingerprint,payload) values($1,$2,$3)',[a,'c'.repeat(64),parseZerodhaStatement(sheet())]),/row-level security/);await assert.rejects(db.query('update broker_statements set payload=$1',[parseZerodhaStatement(sheet())]),/permission denied/);await db.exec('set role anon');await assert.rejects(db.query('select * from broker_statements'),/permission denied/);await assert.rejects(db.query('select * from report_snapshots'),/permission denied/);await assert.rejects(db.query('select reserve_ai_review()'),/permission denied/);
 }finally{await db.close();}
});
const costModule=uri((await read('../lib/costs/zerodha.ts')).replace("'../analytics/daily'",JSON.stringify(daily)));
const {parseZerodhaStatement,reconcileStatement,validateStatement}=await import(costModule);
const {workbookRows,unzipWorkbook}=await import(uri((await read('../lib/costs/xlsx.ts')).replace("'fast-xml-parser'",JSON.stringify(import.meta.resolve('fast-xml-parser')))));
const sheet=()=>new Map([['F&O',[
 {B:'P&L Statement for F&O from 2026-10-01 to 2026-10-31'},
 {B:'Charges',C:'2.0001'},{B:'Other Credit & Debit',C:'-1'},{B:'Realized P&L',C:'10'},{B:'Unrealized P&L',C:'4'},
 {B:'Account Head',C:'Amount'},{B:'Brokerage',C:'2.0001'},
 {B:'Symbol',G:'Realized P&L'},{B:'NIFTY',G:'10'}]],['Other Debits and Credits',[{B:'Other Debits and Credits for FO from 2026-10-01 to 2026-10-31'},{B:'Particulars',C:'Posting Date',D:'Debit',E:'Credit'},{B:'Call and trade',C:'2026-10-07',D:'1',E:'0'}]]]);
test('broker net uses exact charges and signed ledger adjustments, while reconciliation never fabricates matched net',()=>{
 const s=parseZerodhaStatement(sheet());assert.equal(s.net,'6.9999');assert.deepEqual(validateStatement(JSON.parse(JSON.stringify(s))),s);
 assert.equal(reconcileStatement(s,[match('c','2026-10-07T10:00:00+05:30','10')]).aligned,true);
 const mismatch=reconcileStatement(s,[match('c','2026-10-07T10:00:00+05:30','9')]);assert.equal(mismatch.aligned,false);assert.equal(mismatch.differences[0].statementGross,'10');assert.equal(reconcileStatement(s,[]).aligned,false);
 for(const edit of [m=>m.get('F&O')[1].C='3',m=>m.get('F&O')[8].G='9',m=>m.get('Other Debits and Credits')[2].D='2',m=>m.get('F&O')[0].B='P&L Statement for F&O from 2026-02-30 to 2026-10-31']){const input=sheet();edit(input);assert.throws(()=>parseZerodhaStatement(input));}
 assert.throws(()=>validateStatement({...s,net:'999'}));
});

test('XLSX reader preserves numeric cell text and rejects corrupt archives, path traversal, entities and formulas',()=>{
 const files=[['xl/workbook.xml','<workbook><sheets><sheet name="F&amp;O" r:id="rId1"/></sheets></workbook>'],['xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>'],['xl/worksheets/sheet1.xml','<worksheet><sheetData><row r="1"><c r="B1" t="inlineStr"><is><t>Charges</t></is></c><c r="C1"><v>99999999999999.9999</v></c></row></sheetData></worksheet>']];
 assert.equal(workbookRows(zip(files)).get('F&O')[0].C,'99999999999999.9999');
 const corrupt=zip(files);corrupt[35]^=1;assert.throws(()=>unzipWorkbook(corrupt));assert.throws(()=>unzipWorkbook(zip([['../evil','x']])));assert.throws(()=>workbookRows(zip(files.map(([n,v])=>[n,n.includes('sheet1')?v.replace('<v>','<f>1+1</f><v>'):v]))));assert.throws(()=>workbookRows(zip(files.map(([n,v])=>[n,n.includes('sheet1')?'<!DOCTYPE x [<!ENTITY hi "value">]>'+v:v]))));
});
test('AI action requires consent, authenticates, rebuilds evidence server-side and enforces quota before provider calls',async()=>{
 const state={user:{id:'owner'},quota:true,calls:0,quotaCalls:0,body:null};const stateKey='__tradeMirrorAiTest';globalThis[stateKey]=state;
 const stub=uri(`export async function createClient(){return {rpc:async()=>{globalThis.${stateKey}.quotaCalls++;return {data:globalThis.${stateKey}.quota,error:null}}}};export async function getSignedInUser(){return globalThis.${stateKey}.user};export async function getAccountAnalytics(){return {result:{matches:${JSON.stringify(rows)}}}}`);
 const snapshot=uri((await read('../lib/reports/snapshot.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)).replace("'../analytics/daily'",JSON.stringify(daily)));
 const ai=uri((await read('../lib/reports/ai.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)).replace("'../analytics/daily'",JSON.stringify(daily)));
 let source=await read('../app/reports/ai-actions.ts');for(const path of ['@/lib/supabase/server','@/lib/auth/session','@/lib/workspace/analytics'])source=source.replace(JSON.stringify(path),JSON.stringify(stub)).replace(`'${path}'`,JSON.stringify(stub));source=source.replace("'@/lib/reports/snapshot'",JSON.stringify(snapshot)).replace("'@/lib/reports/ai'",JSON.stringify(ai));
 const {generateAiReview}=await import(uri(source));const originalFetch=globalThis.fetch,oldKey=process.env.OPENAI_API_KEY,oldModel=process.env.OPENAI_MODEL,oldPaid=process.env.TRADEMIRROR_ENABLE_PAID_AI;
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');state.calls++;state.body=JSON.parse(options.body);return {ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({observations:Array.from({length:3},()=>({evidence_id:'limits',reflection:'Source scope is limited.',question:'Is the imported history complete?'}))})}]}]})};};
 try{process.env.OPENAI_API_KEY='test-placeholder';process.env.OPENAI_MODEL='test-model';delete process.env.TRADEMIRROR_ENABLE_PAID_AI;assert.match((await generateAiReview('weekly','2026-10-05',true)).error,/Paid AI is disabled/);assert.equal(state.calls,0);assert.equal(state.quotaCalls,0);process.env.TRADEMIRROR_ENABLE_PAID_AI='false';assert.match((await generateAiReview('weekly','2026-10-05',true)).error,/Paid AI is disabled/);assert.equal(state.calls,0);process.env.TRADEMIRROR_ENABLE_PAID_AI='true';assert.match((await generateAiReview('weekly','2026-10-05',false)).error,/Confirm sharing/);assert.equal(state.calls,0);
 state.user=null;assert.match((await generateAiReview('weekly','2026-10-05',true)).error,/Log in/);state.user={id:'owner'};state.quota=false;assert.match((await generateAiReview('weekly','2026-10-05',true)).error,/90 seconds/);assert.equal(state.calls,0);
 state.quota=true;const r=await generateAiReview('weekly','2026-10-05',true);assert.equal(r.data.observations.length,3);assert.equal(state.calls,1);assert.equal(state.body.store,false);assert.equal(state.body.text.format.strict,true);assert.ok(!state.body.input.includes('entryId'));assert.equal(JSON.parse(state.body.input).evidence[0].fact,reviewEvidence(rows)[0].fact);
 delete process.env.OPENAI_API_KEY;assert.match((await generateAiReview('weekly','2026-10-05',true)).error,/setup required/);assert.equal(state.calls,1);
 }finally{globalThis.fetch=originalFetch;delete globalThis[stateKey];if(oldKey===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldKey;if(oldModel===undefined)delete process.env.OPENAI_MODEL;else process.env.OPENAI_MODEL=oldModel;if(oldPaid===undefined)delete process.env.TRADEMIRROR_ENABLE_PAID_AI;else process.env.TRADEMIRROR_ENABLE_PAID_AI=oldPaid;}
});

test('other-debit ledger validates zero totals, offsetting entries, posting dates and nonnegative debit/credit columns',()=>{
 const zero=sheet();zero.get('F&O')[2].C='0';zero.get('Other Debits and Credits')[2].D='0';assert.equal(parseZerodhaStatement(zero).otherNet,'0');
 zero.get('Other Debits and Credits')[2].D='1';assert.throws(()=>parseZerodhaStatement(zero),/do not equal/);
 zero.get('Other Debits and Credits')[2].E='1';assert.equal(parseZerodhaStatement(zero).otherNet,'0');
 zero.delete('Other Debits and Credits');assert.equal(parseZerodhaStatement(zero).otherNet,'0');
 const negative=sheet();negative.get('Other Debits and Credits')[2].D='-1';negative.get('Other Debits and Credits')[2].E='-2';assert.throws(()=>parseZerodhaStatement(negative),/cannot be negative/);
 const impossible=sheet();impossible.get('F&O')[0].B='P&L Statement for F&O from 2026-04-01 to 2026-05-31';impossible.get('Other Debits and Credits')[0].B='Other Debits and Credits for FO from 2026-04-01 to 2026-05-31';impossible.get('Other Debits and Credits')[2].C='2026-04-31';assert.throws(()=>parseZerodhaStatement(impossible),/posting date/);
});
test('other-debit ledger rejects ambiguous headers and incomplete amount-bearing rows rather than skipping them',()=>{
 for(const edit of [m=>m.get('Other Debits and Credits').push({...m.get('Other Debits and Credits')[0]}),m=>m.get('Other Debits and Credits').push({...m.get('Other Debits and Credits')[1]}),m=>m.get('Other Debits and Credits').push({B:'Missing date',D:'0',E:'0'}),m=>m.get('Other Debits and Credits')[2].B=' ']){const input=sheet();edit(input);assert.throws(()=>parseZerodhaStatement(input));}
});
test('stored broker statement validation rejects impossible dates, negative fees and duplicate breakdowns even when totals reconcile',()=>{
 const good=parseZerodhaStatement(sheet());
 for(const invalid of [{...good,start:'2026-02-30'},{...good,charges:'-2',net:'11',chargeItems:[{label:'Fee',amount:'-2'}]},{...good,chargeItems:[{label:'Fee',amount:'-1'},{label:'Another fee',amount:'3.0001'}]},{...good,chargeItems:[{label:'Fee',amount:'1'},{label:'Fee ',amount:'1.0001'}]},{...good,instruments:[{symbol:'NIFTY',gross:'5'},{symbol:'NIFTY ',gross:'5'}]}])assert.throws(()=>validateStatement(invalid));
 assert.deepEqual(validateStatement(JSON.parse(JSON.stringify(good))),good);
});

test('statement charge differences retain sub-paisa precision and reject both directions',()=>{
 for(const [charge,delta] of [['2.0002','-0.0001'],['2','0.0001']]){
  const input=sheet();input.get('F&O')[1].C=charge;
  assert.throws(()=>parseZerodhaStatement(input),error=>error.message.includes('breakdown minus summary: INR '+delta+'.')&&error.message.includes('not been saved'));
 }
});

test('gross reconciliation exposes offsetting contract gaps and respects broker/date scope',()=>{
 const s=parseZerodhaStatement(sheet());
 const input=[{...match('one','2026-10-07T10:00:00+05:30','9'),symbol:'NIFTY'}, {...match('two','2026-10-07T10:00:00+05:30','1'),symbol:'OTHER'}, {...match('old','2026-09-30T10:00:00+05:30','100'),symbol:'NIFTY'}, {...match('foreign','2026-10-07T10:00:00+05:30','100'),broker:'OTHER'}];
 const r=reconcileStatement(s,input);assert.equal(r.grossDifference,'0');assert.equal(r.aligned,false);assert.equal(r.slices,2);
 assert.deepEqual(r.differences.map(d=>[d.symbol,d.difference,d.source]),[['NIFTY','-1','both'],['OTHER','1','import-only']]);
 const empty=reconcileStatement(s,[]);assert.equal(empty.grossDifference,'-10');assert.equal(empty.differences[0].source,'statement-only');assert.equal(empty.aligned,false);
});
