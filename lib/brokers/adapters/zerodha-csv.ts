export const MAX_CSV_BYTES = 5 * 1024 * 1024;
export const MAX_CSV_ROWS = 10000;
export interface Execution {symbol:string;exchange:string;segment:string;side:'BUY'|'SELL';quantity:string;price:string;tradeId:string;orderId:string;executedAt:string;key:string;row:number}
export interface Preview {executions:Execution[];issues:{row:number;message:string}[];duplicates:number;total:number}
function csv(text:string):string[][] {
 const rows:string[][]=[];let row:string[]=[];let cell='';let quoted=false;let closed=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){if(cell||closed)throw new Error('Unexpected quote in CSV.');quoted=true;continue;}
  if(c===','||c==='\n'||c==='\r'){
   row.push(cell);cell='';closed=false;
   if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v.trim()))rows.push(row);row=[];if(rows.length>MAX_CSV_ROWS+1)throw new Error('Maximum 10,000 execution rows per file.');}
  }else{if(closed&&c!==' '&&c!=='\t')throw new Error('Unexpected text after a quoted CSV field.');if(!closed)cell+=c;}
 }
 if(quoted)throw new Error('Unclosed quoted CSV field.');
 row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 if(rows.length>MAX_CSV_ROWS+1)throw new Error('Maximum 10,000 execution rows per file.');
 return rows;
}
function timestamp(date:string,value:string):string|null {
 // Console timestamps without an offset represent India Standard Time.
 const match=value.match(/^(?:(\d{4}-\d{2}-\d{2})[ T])?(\d{2}):(\d{2}):(\d{2})$/);
 if(!match||!/^\d{4}-\d{2}-\d{2}$/.test(date)||match[1]&&match[1]!==date)return null;
 const [y,m,d]=date.split('-').map(Number);const check=new Date(Date.UTC(y,m-1,d));
 if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d||+match[2]>23||+match[3]>59||+match[4]>59)return null;
 return `${date}T${match[2]}:${match[3]}:${match[4]}+05:30`;
}
export function parseZerodhaCsv(text:string):Preview {
 if(new TextEncoder().encode(text).length>MAX_CSV_BYTES)throw new Error('Choose a CSV no larger than 5 MB.');
 const rows=csv(text);if(rows.length<2)throw new Error('The CSV must contain a header and at least one execution.');
 const headers=rows[0].map(h=>h.trim().toLowerCase().replace(/[ -]+/g,'_'));
 if(new Set(headers).size!==headers.length)throw new Error('Duplicate column names in CSV.');
 const symbol=headers.includes('symbol')?'symbol':'tradingsymbol';
 const required=[symbol,'trade_date','exchange','segment','trade_type','quantity','price','trade_id','order_id','order_execution_time'];
 const missing=required.filter(h=>!headers.includes(h));if(missing.length)throw new Error(`Missing columns: ${missing.join(', ')}. Use a Console tradebook CSV, not a P&L report.`);
 const result:Preview={executions:[],issues:[],duplicates:0,total:rows.length-1};const seen=new Map<string,string>();
 rows.slice(1).forEach((cells,index)=>{
  const row=index+2;const fail=(message:string)=>result.issues.push({row,message});
  if(cells.length!==headers.length){fail('Column count does not match the header.');return;}
  const data=Object.fromEntries(headers.map((h,i)=>[h,cells[i].trim()]));
  const side=data.trade_type.toUpperCase();const quantity=data.quantity;const price=data.price;
  const decimal=(s:string)=>/^\d{1,14}(?:\.\d{1,4})?$/.test(s);
  const executedAt=timestamp(data.trade_date,data.order_execution_time);
  if(!data[symbol]||data[symbol].length>120||!data.exchange||!data.segment||!data.trade_id||!data.order_id){fail('Instrument, exchange, segment, trade ID and order ID are required.');return;}
  if(side!=='BUY'&&side!=='SELL'){fail('Trade type must be BUY or SELL.');return;}
  if(!decimal(quantity)||Number(quantity)<=0||!decimal(price)){fail('Quantity must be positive and price non-negative, with up to four decimals.');return;}
  if(!executedAt){fail('Use YYYY-MM-DD dates and HH:mm:ss execution times (IST).');return;}
  if(data.auction&& !['false','0','no'].includes(data.auction.toLowerCase())){fail('Auction executions are not supported yet.');return;}
  const key=JSON.stringify([data.exchange,data.segment,data.trade_date,data.trade_id]);
  const execution:Execution={symbol:data[symbol],exchange:data.exchange,segment:data.segment,side,quantity,price,tradeId:data.trade_id,orderId:data.order_id,executedAt,key,row};
  const canonical=JSON.stringify({...execution,row:0});
  if(seen.has(key)){if(seen.get(key)===canonical)result.duplicates++;else fail('Conflicting executions share the same trade ID.');return;}
  seen.set(key,canonical);result.executions.push(execution);
 });
 return result;
}
