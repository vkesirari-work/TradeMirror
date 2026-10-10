export interface Fill {id:string;broker:string;symbol:string;exchange:string;segment:string;side:'BUY'|'SELL';quantity:string;price:string;executedAt:string}
export interface Match {id:string;broker:string;symbol:string;side:'LONG'|'SHORT';quantity:string;entryPrice:string;exitPrice:string;entryTime:string;exitTime:string;entryId:string;exitId:string;grossPnl:string}
export interface Position {broker:string;symbol:string;side:'LONG'|'SHORT';quantity:string;entryPrice:string;entryTime:string}
export interface MatchingResult {matches:Match[];positions:Position[];grossPnl:string;wins:number;losses:number;breakeven:number;ambiguousTimestamps:number}
const SCALE=BigInt(10000);
function units(value:string):bigint {
 if(!/^\d{1,14}(?:\.\d{1,4})?$/.test(value))throw new Error('Invalid decimal execution value.');
 const [whole,fraction='']=value.split('.');return BigInt(whole)*SCALE+BigInt(fraction.padEnd(4,'0'));
}
function decimal(value:bigint,places=4):string {
 const sign=value<BigInt(0)?'-':'';const absolute=value<BigInt(0)?-value:value;const scale=BigInt(10)**BigInt(places);
 const fraction=(absolute%scale).toString().padStart(places,'0').replace(/0+$/,'');return `${sign}${absolute/scale}${fraction?'.'+fraction:''}`;
}
function compareId(a:string,b:string):number {if(/^\d+$/.test(a)&&/^\d+$/.test(b)){const x=BigInt(a),y=BigInt(b);return x<y?-1:x>y?1:0;}return a<b?-1:a>b?1:0;}
export function matchExecutions(input:Fill[]):MatchingResult {
 const result:MatchingResult={matches:[],positions:[],grossPnl:'0',wins:0,losses:0,breakeven:0,ambiguousTimestamps:0};
 const groups=new Map<string,Fill[]>();const unique=new Set<string>();
 for(const fill of input){
  const identity=JSON.stringify([fill.broker,fill.exchange,fill.segment,fill.id]);if(unique.has(identity))throw new Error('Duplicate execution identity in matching input.');unique.add(identity);
  if(!fill.symbol||!fill.broker||!fill.exchange||!fill.segment||!['BUY','SELL'].includes(fill.side)||!Number.isFinite(Date.parse(fill.executedAt))||units(fill.quantity)<=BigInt(0))throw new Error('Invalid execution for matching.');units(fill.price);
  const key=JSON.stringify([fill.broker,fill.exchange,fill.segment,fill.symbol]);const group=groups.get(key)||[];group.push(fill);groups.set(key,group);
 }
 let gross=BigInt(0);
 for(const group of groups.values()){
  group.sort((a,b)=>Date.parse(a.executedAt)-Date.parse(b.executedAt)||compareId(a.id,b.id));
  const sidesAtTime=new Map<string,Set<string>>();for(const fill of group){const key=new Date(fill.executedAt).toISOString();const sides=sidesAtTime.get(key)||new Set<string>();sides.add(fill.side);sidesAtTime.set(key,sides);}result.ambiguousTimestamps+=[...sidesAtTime.values()].filter(s=>s.size>1).length;
  const lots:{fill:Fill;remaining:bigint}[]=[];let head=0;
  for(const fill of group){
   let remaining=units(fill.quantity);const price=units(fill.price);
   while(remaining>BigInt(0)&&head<lots.length&&lots[head].fill.side!==fill.side){
    const lot=lots[head];const quantity=remaining<lot.remaining?remaining:lot.remaining;
    const pnl=(price-units(lot.fill.price))*quantity*(lot.fill.side==='BUY'?BigInt(1):-BigInt(1));
    const id=JSON.stringify([fill.broker,fill.exchange,fill.segment,lot.fill.id,fill.id]);
    result.matches.push({id,broker:fill.broker,symbol:fill.symbol,side:lot.fill.side==='BUY'?'LONG':'SHORT',quantity:decimal(quantity),entryPrice:lot.fill.price,exitPrice:fill.price,entryTime:lot.fill.executedAt,exitTime:fill.executedAt,entryId:lot.fill.id,exitId:fill.id,grossPnl:decimal(pnl,8)});
    gross+=pnl;if(pnl>BigInt(0))result.wins++;else if(pnl<BigInt(0))result.losses++;else result.breakeven++;
    remaining-=quantity;lot.remaining-=quantity;if(lot.remaining===BigInt(0))head++;
   }
   if(remaining>BigInt(0))lots.push({fill,remaining});
  }
  for(const lot of lots.slice(head))result.positions.push({broker:lot.fill.broker,symbol:lot.fill.symbol,side:lot.fill.side==='BUY'?'LONG':'SHORT',quantity:decimal(lot.remaining),entryPrice:lot.fill.price,entryTime:lot.fill.executedAt});
 }
 result.matches.sort((a,b)=>Date.parse(a.exitTime)-Date.parse(b.exitTime)||a.id.localeCompare(b.id));result.grossPnl=decimal(gross,8);return result;
}
