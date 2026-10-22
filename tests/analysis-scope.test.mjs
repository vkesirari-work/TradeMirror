import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=(await readFile(new URL('../lib/analytics/scope.ts',import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const {journalScopeQuery,readJournalScope,recentExitRange}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
const filters={start:'2026-09-22',end:'2026-10-07',symbol:'NIFTY26OCT25000CE',side:'LONG',option:'CE'};
test('dashboard journal scope preserves date, instrument, side, option and explicit examples',()=>{
 const query=new URLSearchParams(journalScopeQuery(filters,'',true));
 assert.deepEqual(Object.fromEntries(query),{examples:'include',...filters});
 assert.deepEqual(readJournalScope(Object.fromEntries(query)),{initialSymbol:filters.symbol,initialSide:'LONG',initialOption:'CE'});
});
test('calendar drilldown selects the day without losing the remaining scope',()=>{
 const query=new URLSearchParams(journalScopeQuery(filters,'2026-10-05'));
 assert.equal(query.get('day'),'2026-10-05');assert.equal(query.has('start'),false);assert.equal(query.has('end'),false);
 assert.equal(query.get('symbol'),filters.symbol);assert.equal(query.get('option'),'CE');assert.equal(query.has('examples'),false);
 assert.equal(journalScopeQuery({start:'',end:'',symbol:'',side:'',option:''}),'');
});
test('journal scope rejects unsupported option/side and oversized or non-string symbols',()=>{
 assert.deepEqual(readJournalScope({symbol:'x'.repeat(201),side:'BUY',option:'CALL'}),{initialSymbol:'',initialSide:'ALL',initialOption:''});
 assert.equal(readJournalScope({symbol:['A','B']}).initialSymbol,'');
 const symbol='NIFTY + & CE';assert.equal(new URLSearchParams(journalScopeQuery({...filters,symbol})).get('symbol'),symbol);
});

test('quick ranges anchor to recorded exits and use inclusive calendar days across months',()=>{assert.deepEqual(recentExitRange(['2026-09-30','2026-10-07','2026-09-21'],7),{start:'2026-10-01',end:'2026-10-07'});assert.deepEqual(recentExitRange(['2026-10-07'],14),{start:'2026-09-24',end:'2026-10-07'});assert.deepEqual(recentExitRange([],7),{start:'',end:''});assert.deepEqual(recentExitRange(['2026-10-07'],0),{start:'',end:''});});
