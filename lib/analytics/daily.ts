import type { Match } from './matching';
export interface GrossDay {date:string;grossPnl:string;cumulativeGross:string;slices:number}
export function tradingDate(timestamp:string):string {
 const millis=Date.parse(timestamp);if(!Number.isFinite(millis))throw new Error('Invalid execution timestamp.');
 return new Date(millis+330*60*1000).toISOString().slice(0,10);
}
export function exactUnits(value:string):bigint {
 if(!/^-?\d+(?:\.\d{1,8})?$/.test(value))throw new Error('Invalid gross P&L.');
 const negative=value.startsWith('-');const [whole,fraction='']=value.replace(/^-/,'').split('.');
 return (BigInt(whole)*BigInt(100000000)+BigInt(fraction.padEnd(8,'0')))*(negative?BigInt(-1):BigInt(1));
}
export function decimal(value:bigint):string {
 const negative=value<BigInt(0);const v=negative?-value:value;const fraction=(v%BigInt(100000000)).toString().padStart(8,'0').replace(/0+$/,'');
 return `${negative?'-':''}${v/BigInt(100000000)}${fraction?'.'+fraction:''}`;
}
export function summarizeMatches(matches:Match[]):GrossDay[]{
 const grouped=new Map<string,{gross:bigint;slices:number}>();
 for(const match of matches){const day=tradingDate(match.exitTime);const item=grouped.get(day)||{gross:BigInt(0),slices:0};item.gross+=exactUnits(match.grossPnl);item.slices++;grouped.set(day,item);}
 let cumulative=BigInt(0);return [...grouped.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([date,item])=>{cumulative+=item.gross;return {date,grossPnl:decimal(item.gross),cumulativeGross:decimal(cumulative),slices:item.slices};});
}
