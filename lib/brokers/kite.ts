import {parseKiteJson,parseKiteTrades} from './adapters/kite-trades';
import {tradingDate} from '../analytics/daily';
export type KiteConfig={apiKey:string;accessToken:string;brokerUserId:string};
async function get(path:'/user/profile'|'/trades',config:KiteConfig,transport:typeof fetch){
 const response=await transport('https://api.kite.trade'+path,{method:'GET',headers:{'X-Kite-Version':'3',Authorization:`token ${config.apiKey}:${config.accessToken}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(response.status===401||response.status===403?'Broker session expired or access denied. Renew it through the approved Kite setup.':response.status===429?'Broker rate limit reached. Retry later.':'Broker service unavailable. Retry later.');
 if(!response.body)throw new Error('Empty broker response.');const reader=response.body.getReader();let bytes=0;const decoder=new TextDecoder();let raw='';try{while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>5*1024*1024)throw new Error('Broker response exceeds 5 MB.');raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();}finally{await reader.cancel();}return raw;
}
export async function readKiteToday(config:KiteConfig,clock:()=>Date=()=>new Date(),transport:typeof fetch=fetch){
 if(!config.apiKey||!config.accessToken||!config.brokerUserId)throw new Error('Broker sync is not configured.');
 const date=tradingDate(clock().toISOString());const profile=parseKiteJson(await get('/user/profile',config,transport)) as {status?:string;data?:{user_id?:string}};
 if(profile.status!=='success'||profile.data?.user_id!==config.brokerUserId)throw new Error('Broker account does not match the configured owner. Nothing was imported.');
 const result=parseKiteTrades(await get('/trades',config,transport),date);if(tradingDate(clock().toISOString())!==date)throw new Error('IST day changed. Refresh the preview.');return {date,...result};
}
