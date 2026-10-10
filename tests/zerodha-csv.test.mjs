import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseZerodhaCsv,MAX_CSV_BYTES} from '../lib/brokers/adapters/zerodha-csv.ts';
const header='symbol,trade_date,exchange,segment,trade_type,quantity,price,trade_id,order_id,order_execution_time';
const row='NIFTY26OCT25000CE,2026-10-07,NFO,FO,buy,75,124.5000,90071992547409931234,90071992547409931235,2026-10-07 09:24:00';
test('Console executions preserve large IDs and decimal strings, resolve IST, and deduplicate',()=>{
 const result=parseZerodhaCsv('\uFEFF'+header+'\r\n'+row+'\r\n'+row);
 assert.equal(result.duplicates,1);assert.equal(result.total,2);assert.equal(result.issues.length,0);
 assert.equal(result.executions[0].tradeId,'90071992547409931234');assert.equal(result.executions[0].price,'124.5000');
 assert.equal(new Date(result.executions[0].executedAt).toISOString(),'2026-10-07T03:54:00.000Z');
});
test('quoted commas, escaped quotes and multiline cells parse without splitting records',()=>{
 const result=parseZerodhaCsv(header+',note\n'+row.replace('NIFTY26OCT25000CE','"NIFTY, symbol"')+',"Line one\nLine ""two"""');
 assert.equal(result.executions[0].symbol,'NIFTY, symbol');assert.equal(result.issues.length,0);
});
test('bad schema, malformed quoting, empty files and oversized files fail explicitly',()=>{
 for(const input of ['',header,header.replace('price','quantity')+'\n'+row,'wrong,columns\n1,2',header+'\n"unfinished', 'x'.repeat(MAX_CSV_BYTES+1)])assert.throws(()=>parseZerodhaCsv(input));
});
test('rejects impossible dates, negative or imprecise numbers and conflicting IDs',()=>{
 for(const bad of [row.replace('2026-10-07','2026-02-30'),row.replace(',75,',',-75,'),row.replace('124.5000','124.12345'),row.replace('09:24:00','25:24:00'),row.replace(',buy,',',transfer,')]){
  const result=parseZerodhaCsv(header+'\n'+bad);assert.equal(result.executions.length,0);assert.equal(result.issues.length,1);
 }
 const result=parseZerodhaCsv(header+'\n'+row+'\n'+row.replace('124.5000','125'));
 assert.equal(result.issues.length,1);assert.equal(result.duplicates,0);
});
test('supports older tradingsymbol header and time-only values; rejects auction rows and excessive records',()=>{
 const result=parseZerodhaCsv(header.replace('symbol','tradingsymbol')+'\n'+row.replace('2026-10-07 09:24:00','09:24:00'));
 assert.equal(result.executions.length,1);
 assert.equal(parseZerodhaCsv(header+',auction\n'+row+',true').issues.length,1);
 assert.throws(()=>parseZerodhaCsv(header+'\n'+Array(10001).fill(row).join('\n')),/10,000/);
});
