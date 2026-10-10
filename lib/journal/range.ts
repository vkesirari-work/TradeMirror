import {tradingDate} from '../analytics/daily';
import type {Match} from '../analytics/matching';
export function reviewRange(matches:Match[],start:unknown='',end:unknown=''){
 function valid(value:unknown){return typeof value==='string'&&(value===''||(/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value));}
 if(!valid(start)||!valid(end)||Boolean(start&&end&&String(start)>String(end)))return {matches:[] as Match[],start:'',end:'',error:'Use valid exit dates with the start on or before the end.'};
 return {matches:matches.filter(m=>{const date=tradingDate(m.exitTime);return (!start||date>=String(start))&&(!end||date<=String(end));}),start:String(start),end:String(end)};
}
