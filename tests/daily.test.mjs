import{test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{stripTypeScriptTypes}from'node:module';
const source=(await readFile(new URL('../lib/analytics/daily.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');const {tradingDate,summarizeMatches}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
test('daily summaries use the IST exit date and exact signed decimal accumulation',()=>{
 assert.equal(tradingDate('2026-10-07T18:45:00Z'),'2026-10-08');
 const summary=summarizeMatches([{exitTime:'2026-10-07T18:45:00Z',grossPnl:'0.00000001'},{exitTime:'2026-10-07T10:00:00Z',grossPnl:'99999999999999.99'},{exitTime:'2026-10-07T11:00:00Z',grossPnl:'-99999999999999.98'}]);
 assert.deepEqual(summary,[{date:'2026-10-07',grossPnl:'0.01',cumulativeGross:'0.01',slices:2},{date:'2026-10-08',grossPnl:'0.00000001',cumulativeGross:'0.01000001',slices:1}]);assert.deepEqual(summarizeMatches([]),[]);
});
