import {advancedSummary,reportPeriods} from '../analytics/advanced';
import {exactUnits} from '../analytics/daily';
import type {Match} from '../analytics/matching';
export type ReportMode='daily'|'weekly';
export function reportSelection(matches:Match[],mode:unknown,date:unknown){
 if((mode!=='daily'&&mode!=='weekly')||typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Choose a valid report period.');
 const period=reportPeriods(matches,mode).find(p=>p.date===date);
 if(!period)throw new Error('This period has no matching exits in the current history. Refresh reports.');
 return period;
}
export function reportSnapshot(rows:Match[],mode:ReportMode,date:string){
 const s=advancedSummary(rows);
 return {format:'trademirror-report',version:1,mode,period:date,currency:'INR',timezone:'Asia/Kolkata',scope:'real imports only',costsStatus:'unavailable',summary:{grossPnl:s.grossPnl,grossProfit:s.grossProfit,grossLoss:s.grossLoss,slices:s.slices,wins:s.wins,losses:s.losses,breakeven:s.breakeven,winRate:s.winRate,profitFactor:s.profitFactor,averageHoldMinutes:s.averageHoldMinutes,maxDrawdown:s.maxDrawdown,days:s.days},limits:'FIFO slices, not whole positions. Charges, unrealized P&L and missing prior history are not included.'};
}
export type Snapshot=ReturnType<typeof reportSnapshot>;
export type SavedSnapshot={id:string;created_at:string;mode:ReportMode;period:string;fingerprint:string;payload:Snapshot};

function validDate(value:unknown):value is string{return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
export function validateSnapshot(value:unknown):Snapshot{
 if(!value||typeof value!=='object')throw new Error('Saved report format is unsupported.');const v=value as Snapshot;
 if(v.format!=='trademirror-report'||v.version!==1||!['daily','weekly'].includes(v.mode)||!validDate(v.period)||v.currency!=='INR'||v.timezone!=='Asia/Kolkata'||v.costsStatus!=='unavailable'||!['real imports only','synthetic demo'].includes(v.scope)||typeof v.limits!=='string'||v.limits.length>2000)throw new Error('Saved report format is unsupported.');
 const s=v.summary;if(!s||!Array.isArray(s.days)||s.days.length>7)throw new Error('Saved report metrics are unsupported.');
 for(const field of ['grossPnl','grossProfit','grossLoss','maxDrawdown'] as const)if(typeof s[field]!=='string'||! /^-?\d{1,30}(?:\.\d{1,8})?$/.test(s[field]))throw new Error('Saved report amount is unsupported.');
 for(const field of ['slices','wins','losses','breakeven'] as const)if(!Number.isSafeInteger(s[field])||s[field]<0||s[field]>100000)throw new Error('Saved report count is unsupported.');
 if(s.wins+s.losses+s.breakeven!==s.slices||s.slices===0||typeof s.winRate!=='string'||!/^\d{1,3}\.\d$/.test(s.winRate)||Number(s.winRate)>100||s.profitFactor!==null&&(typeof s.profitFactor!=='string'||!/^\d+(?:\.\d{2})$/.test(s.profitFactor))||s.averageHoldMinutes!==null&&(typeof s.averageHoldMinutes!=='string'||!/^\d+\.\d$/.test(s.averageHoldMinutes)))throw new Error('Saved report metrics are unsupported.');
 for(const d of s.days)if(!d||typeof d.date!=='string'||!validDate(d.date)||typeof d.grossPnl!=='string'||! /^-?\d{1,30}(?:\.\d{1,8})?$/.test(d.grossPnl)||!Number.isSafeInteger(d.slices)||d.slices<1)throw new Error('Saved report daily rows are unsupported.');
 const profit=exactUnits(s.grossProfit),loss=exactUnits(s.grossLoss),drawdown=exactUnits(s.maxDrawdown);
 if(profit<BigInt(0)||loss<BigInt(0)||drawdown<BigInt(0)||drawdown>loss||profit-loss!==exactUnits(s.grossPnl)||(s.wins===0)!==(profit===BigInt(0))||(s.losses===0)!==(loss===BigInt(0))||s.winRate!==(s.wins/s.slices*100).toFixed(1))throw new Error('Saved report totals are inconsistent.');
 if(loss===BigInt(0)){if(s.profitFactor!==null)throw new Error('Saved report ratio is inconsistent.');}
 else{const ratio=(profit*BigInt(100)+loss/BigInt(2))/loss;const expected=`${ratio/BigInt(100)}.${(ratio%BigInt(100)).toString().padStart(2,'0')}`;if(s.profitFactor!==expected)throw new Error('Saved report ratio is inconsistent.');}
 const start=Date.parse(v.period),end=start+(v.mode==='weekly'?7:1)*86400000;
 if(v.mode==='weekly'&&new Date(start).getUTCDay()!==1)throw new Error('Saved weekly report must start on Monday.');
 let count=0,total=BigInt(0),previous='';
 for(const day of s.days){
  const date=Date.parse(day.date);
  if(day.date<=previous||date<start||date>=end)throw new Error('Saved daily evidence falls outside its report period.');
  total+=exactUnits(day.grossPnl);count+=day.slices;previous=day.date;
  if(typeof day.cumulativeGross!=='string'||! /^-?\d{1,30}(?:\.\d{1,8})?$/.test(day.cumulativeGross)||exactUnits(day.cumulativeGross)!==total)throw new Error('Saved cumulative evidence is inconsistent.');
 }
 if(count!==s.slices||total!==exactUnits(s.grossPnl)||!s.days.length)throw new Error('Saved daily evidence does not match the summary.');
 return v;
}
