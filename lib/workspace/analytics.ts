import 'server-only';
import { cache } from 'react';
import { getSignedInUser } from '@/lib/auth/session';
import { isExampleExecution } from '@/lib/analytics/examples';
import { createClient } from '@/lib/supabase/server';
import { matchExecutions,type Fill } from '@/lib/analytics/matching';
export const getAccountAnalytics=cache(async(includeExample=false)=>{
 const client=await createClient();if(!client)throw new Error('Account data is not configured.');
 const user=await getSignedInUser();if(!user)throw new Error('Your session expired. Log in again.');
 const fills:Fill[]=[];let expected:number|null=null;
 for(let offset=0;offset<50000;offset+=1000){
  const {data,error,count}=await client.from('orders').select('id,broker,instrument,side,quantity::text,price::text,executed_at,execution_id',{count:'exact'}).eq('user_id',user.id).order('executed_at').order('id').range(offset,offset+999);
  if(error||count===null)throw new Error('Unable to load executions. Refresh to retry.');
  if(count>50000)throw new Error('This account exceeds the current 50,000 execution analysis limit. No partial totals are shown.');
  if(expected!==null&&count!==expected)throw new Error('Your imports changed during analysis. Refresh to load the complete history.');expected=count;
  for(const row of data||[]){
   const identity:unknown=JSON.parse(row.execution_id);
   if(!Array.isArray(identity)||identity.length!==4||identity.some(x=>typeof x!=='string'))throw new Error('An execution has an unsupported identity. Analysis is unavailable.');
   if(typeof row.quantity!=='string'||typeof row.price!=='string'||!['BUY','SELL'].includes(row.side))throw new Error('Execution data is not in the expected format.');
   fills.push({id:row.execution_id,broker:row.broker,symbol:row.instrument,exchange:identity[0],segment:identity[1],side:row.side as 'BUY'|'SELL',quantity:row.quantity,price:row.price,executedAt:row.executed_at});
  }
  if(fills.length===expected)break;
  if(!data?.length)throw new Error('Execution history could not be loaded completely.');
 }
 const {count:finalCount,error:finalError}=await client.from('orders').select('id',{count:'exact',head:true}).eq('user_id',user.id);
 if(finalError||finalCount!==fills.length)throw new Error('Your imports changed during analysis. Refresh to retry.');
 const exampleCount=fills.filter(isExampleExecution).length;
 const included=includeExample?fills:fills.filter(fill=>!isExampleExecution(fill));
 return {fills:included,result:matchExecutions(included),containsExample:includeExample&&exampleCount>0,exampleCount,includeExample};
});
