import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const uri=source=>'data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(source)).toString('base64');
const read=async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import type .*;$/gm,'');
const daily=uri(await read('../lib/analytics/daily.ts'));
const advanced=uri((await read('../lib/analytics/advanced.ts')).replace("'./daily'",JSON.stringify(daily)));
const annotation=uri(await read('../lib/journal/annotation.ts'));
const {sliceIdentity}=await import(annotation);
const {strategyReview,annotationStatus}=await import(uri((await read('../lib/journal/strategy.ts')).replace("'../analytics/advanced'",JSON.stringify(advanced)).replace("'./annotation'",JSON.stringify(annotation))));
const match=(id,pnl)=>({id,broker:'ZERODHA',symbol:'NIFTY',side:'LONG',quantity:'1',entryPrice:'100',exitPrice:'101',entryTime:'2026-10-07T09:00:00+05:30',exitTime:'2026-10-07T09:10:00+05:30',grossPnl:pnl});
test('strategy groups preserve exact precision, deduplicate labels and disclose overlapping coverage',()=>{
 const a=match('a','99999999999999.99'),b=match('b','-99999999999999.98'),c=match('c','0.00000001');
 const tags={[sliceIdentity(a)]:['breakout','morning','breakout'],[sliceIdentity(b)]:['breakout']};
 const review=strategyReview([a,b,c],tags);assert.equal(review.tagged,2);assert.equal(review.untagged,1);
 assert.equal(review.groups[0].summary.grossPnl,'0.01');assert.equal(review.groups[0].summary.slices,2);assert.equal(review.groups[1].summary.slices,1);
 assert.deepEqual(strategyReview([],tags),{tagged:0,untagged:0,groups:[]});
 assert.equal(strategyReview([{...a,quantity:'2'}],tags).tagged,0);
});
test('connection status distinguishes hidden scope from absent evidence without double counting or moving keys',()=>{
 const selected=new Set(['real']),full=new Set(['real','example']);
 assert.deepEqual(annotationStatus(['real','example','old','old'],selected,full),{linked:1,outsideScope:1,unlinked:1});
 assert.deepEqual(annotationStatus(['old'],new Set(['old']),new Set(['old'])),{linked:1,outsideScope:0,unlinked:0});
 assert.deepEqual([...selected],['real']);
});
