import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import{stripTypeScriptTypes}from'node:module';
import{matchExecutions}from'../lib/analytics/matching.ts';
let client;globalThis.analyticsTest={createClient:async()=>client,matchExecutions};
const source=(await readFile(new URL('../lib/workspace/analytics.ts',import.meta.url),'utf8')).replace(/^import .*;$/gm,'');
const module=await import('data:text/javascript;base64,'+Buffer.from("const cache=f=>f;const {createClient,matchExecutions}=globalThis.analyticsTest;"+stripTypeScriptTypes(source)).toString('base64'));
function fixture(rows,{count=rows.length,finalCount=count,auth=true}={}){
 const calls=[];
 client={auth:{getUser:async()=>({data:{user:auth?{id:'owner'}:null},error:null})},from:table=>{
  assert.equal(table,'orders');const q={head:false,select(fields,options){this.head=!!options.head;if(!this.head)assert.match(fields,/quantity::text,price::text/);return this;},eq(column,value){assert.equal(column,'user_id');assert.equal(value,'owner');return this;},order(){return this;},range(start,end){calls.push([start,end]);return Promise.resolve({data:rows.slice(start,end+1),count,error:null});},then(resolve,reject){return Promise.resolve({count:finalCount,error:null}).then(resolve,reject);}};return q;
 }};return calls;
}
const row=i=>({id:String(i),broker:'ZERODHA',instrument:'NIFTY',side:'BUY',quantity:'1',price:'99999999999999.9999',executed_at:'2026-10-07T09:00:00+05:30',execution_id:JSON.stringify(['NFO','FO','2026-10-07',String(i)])});
test('account loader pages beyond 1000 rows and keeps monetary data as exact text',async()=>{
 const calls=fixture(Array.from({length:1001},(_,i)=>row(i)));const result=await module.getAccountAnalytics();assert.equal(result.fills.length,1001);assert.deepEqual(calls,[[0,999],[1000,1999]]);assert.equal(result.fills[0].price,'99999999999999.9999');
});
test('account loader rejects incomplete changing histories, floating-point prices and absent sessions',async()=>{
 fixture([row(1)],{finalCount:2});await assert.rejects(module.getAccountAnalytics(),/changed/);
 fixture([{...row(1),price:100}]);await assert.rejects(module.getAccountAnalytics(),/format/);
 fixture([row(1)],{count:50001});await assert.rejects(module.getAccountAnalytics(),/50,000/);
 fixture([],{auth:false});await assert.rejects(module.getAccountAnalytics(),/session expired/);
 fixture([{...row(1),execution_id:'[]'}]);await assert.rejects(module.getAccountAnalytics(),/identity/);
});
