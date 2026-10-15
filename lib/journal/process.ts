import type {ReviewEntry} from './review';
import {CHECKLIST} from './annotation';
import {tradingDate} from '../analytics/daily';
export function processSummary(entries:ReviewEntry[]){
 const questions=new Map<string,{question:string;checked:number;recorded:number}>();
 const weeks=new Map<string,{week:string;entries:number;checked:number;recorded:number}>();
 let checked=0,recorded=0,linked=0;
 for(const entry of entries){
  const items=entry.plan_items||CHECKLIST;
  items.forEach((question,i)=>{const row=questions.get(question)||{question,checked:0,recorded:0};row.recorded++;recorded++;if(entry.checklist[i]){row.checked++;checked++;}questions.set(question,row);});
  if(entry.connection==='linked'&&entry.evidence){const day=tradingDate(entry.evidence.exitTime);const date=new Date(day+'T00:00:00Z');if(!Number.isFinite(date.getTime()))continue;date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);const week=date.toISOString().slice(0,10),row=weeks.get(week)||{week,entries:0,checked:0,recorded:0};row.entries++;row.checked+=entry.checklist.filter(Boolean).length;row.recorded+=items.length;weeks.set(week,row);linked++;}
 }
 return {entries:entries.length,checked,recorded,linked,withoutDatedEvidence:entries.length-linked,questions:[...questions.values()].sort((a,b)=>a.question.localeCompare(b.question)),weeks:[...weeks.values()].sort((a,b)=>b.week.localeCompare(a.week))};
}
