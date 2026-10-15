import {parseZerodhaCsv,MAX_CSV_BYTES,type Preview} from './zerodha-csv';
// Validate JSON first, then preserve numeric lexemes before parsing financial values.
export function parseKiteJson(raw:string):unknown{
 if(new TextEncoder().encode(raw).length>MAX_CSV_BYTES)throw new Error('Broker response exceeds 5 MB.');
 JSON.parse(raw);
 let out='',quoted=false,escaped=false;
 for(let i=0;i<raw.length;i++){const c=raw[i];if(quoted){out+=c;if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}if(c==='"'){quoted=true;out+=c;continue;}if(c==='-'||/[0-9]/.test(c)){const token=raw.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)![0];out+=JSON.stringify(token);i+=token.length-1;}else out+=c;}
 return JSON.parse(out);
}
export function parseKiteTrades(raw:string,date:string):{preview:Preview;skipped:number}{
 const data=parseKiteJson(raw) as {status?:string;data?:Record<string,unknown>[]};if(data.status!=='success'||!Array.isArray(data.data)||data.data.length>10000)throw new Error('Unsupported broker trade response.');
 const records:string[][]=[];let skipped=0;
 for(const row of data.data){if(!row||typeof row!=='object')throw new Error('Malformed broker trade row.');if(!['NFO','BFO'].includes(String(row.exchange))){skipped++;continue;}
 const fields=['tradingsymbol','exchange','transaction_type','quantity','average_price','trade_id','order_id','fill_timestamp'];if(fields.some(k=>typeof row[k]!=='string'||!row[k]))throw new Error('Incomplete F&O broker execution.');
 const stamp=String(row.fill_timestamp);if(!stamp.startsWith(date+' ')||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(stamp))throw new Error('Broker data is not for the current IST day.');
 records.push([String(row.tradingsymbol),date,String(row.exchange),'FO',String(row.transaction_type),String(row.quantity),String(row.average_price),String(row.trade_id),String(row.order_id),stamp]);}
 if(!records.length)return {preview:{executions:[],issues:[],duplicates:0,total:0},skipped};
 const csv=[['symbol','trade_date','exchange','segment','trade_type','quantity','price','trade_id','order_id','order_execution_time'],...records].map(r=>r.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\n');
 const preview=parseZerodhaCsv(csv);if(preview.issues.length)throw new Error('Broker executions failed validation. Nothing was saved.');return {preview,skipped};
}
