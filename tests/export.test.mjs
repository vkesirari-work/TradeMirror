import {test}from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';import{stripTypeScriptTypes}from'node:module';
const source=(await readFile(new URL('../lib/analytics/export.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');const {exportMatchedCsv}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64'));
test('matched CSV export preserves exact values, escapes CSV text and neutralizes formula instruments',()=>{
 const csv=exportMatchedCsv([{symbol:'=HYPERLINK("bad","x")',broker:'ZERODHA',side:'LONG',quantity:'0.0001',entryPrice:'99999999999999.9999',exitPrice:'1',entryTime:'2026-10-07T09:00:00+05:30',exitTime:'2026-10-07T09:10:00+05:30',grossPnl:'-9999999999.99999999'}]);
 assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/"'=HYPERLINK/);assert.match(csv,/""bad""/);assert.match(csv,/"99999999999999.9999"/);assert.match(csv,/"-9999999999.99999999"/);assert.match(csv,/net P&L unavailable/);
});
