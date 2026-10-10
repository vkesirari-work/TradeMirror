import {test} from 'node:test';import assert from 'node:assert/strict';
import {matchExecutions} from '../lib/analytics/matching.ts';
const base={broker:'ZERODHA',symbol:'NIFTY',exchange:'NFO',segment:'FO',side:'BUY',quantity:'10',price:'100',executedAt:'2026-10-07T09:00:00+05:30'};
const fill=(id,side,quantity,price,time='09:00:00',extra={})=>({...base,id,side,quantity,price,executedAt:`2026-10-07T${time}+05:30`,...extra});
test('FIFO partial fills preserve quantities, price lots, and exact gross P&L',()=>{
 const r=matchExecutions([fill('1','BUY','10','100'),fill('2','BUY','5','110','09:01:00'),fill('3','SELL','12','120','09:02:00')]);
 assert.deepEqual(r.matches.map(m=>[m.quantity,m.grossPnl]),[['10','200'],['2','20']]);assert.equal(r.grossPnl,'220');assert.equal(r.positions[0].quantity,'3');assert.equal(r.positions[0].entryPrice,'110');
});
test('short covers and reversals create residual lots rather than fabricated closes',()=>{
 const r=matchExecutions([fill('1','SELL','10','100'),fill('2','BUY','15','90','09:01:00'),fill('3','SELL','3','95','09:02:00')]);
 assert.equal(r.grossPnl,'115');assert.equal(r.matches[0].side,'SHORT');assert.equal(r.positions[0].side,'LONG');assert.equal(r.positions[0].quantity,'2');
});
test('unsorted executions are stable and broker/exchange/contracts never cross-match',()=>{
 const fills=[fill('2','SELL','10','110','09:01:00'),fill('1','BUY','10','100')];
 assert.deepEqual(matchExecutions(fills),matchExecutions([...fills].reverse()));
 assert.equal(matchExecutions([fills[0],{...fills[1],exchange:'BFO'}]).matches.length,0);
 assert.equal(matchExecutions([fills[0],{...fills[1],symbol:'OTHER'}]).matches.length,0);
 assert.equal(matchExecutions([fills[0],{...fills[1],broker:'OTHER'}]).matches.length,0);
});
test('decimal arithmetic stays exact beyond floating-point precision and leaves open P&L unavailable',()=>{
 const r=matchExecutions([fill('1','BUY','0.0001','99999999999999.9998'),fill('2','SELL','0.0001','99999999999999.9999','09:01:00')]);assert.equal(r.grossPnl,'0.00000001');assert.equal(r.positions.length,0);
 assert.equal(matchExecutions([fill('1','BUY','1','100')]).grossPnl,'0');
});
test('same-time numeric IDs use a deterministic tie break and flag ambiguous chronology',()=>{
 const r=matchExecutions([fill('10','SELL','10','110'),fill('2','BUY','10','100')]);assert.equal(r.matches[0].entryId,'2');assert.equal(r.ambiguousTimestamps,1);
 assert.throws(()=>matchExecutions([fill('1','BUY','10','100'),fill('1','BUY','10','100')]));
 assert.throws(()=>matchExecutions([fill('1','BUY','0','100')]));
});
