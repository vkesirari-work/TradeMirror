import type { Match } from '../analytics/matching';
export const CHECKLIST = ['Entry followed my plan', 'Risk was defined before entry', 'Exit followed my plan'] as const;
export type Annotation = {notes:string;tags:string[];checklist:boolean[];revision:number};
export function sliceIdentity(match:Match):string {
 return JSON.stringify([match.id,match.symbol,match.side,match.quantity,match.entryPrice,match.exitPrice,match.entryTime,match.exitTime]);
}
export function validateAnnotation(value:unknown):Omit<Annotation,'revision'> {
 if(!value||typeof value!=='object')throw new Error('Invalid journal content.');
 const data=value as Record<string,unknown>;
 if(typeof data.notes!=='string'||data.notes.length>10000)throw new Error('Notes must be at most 10,000 characters.');
 if(!Array.isArray(data.tags)||data.tags.length>10||data.tags.some(t=>typeof t!=='string'||!t.trim()||t.trim().length>40))throw new Error('Use at most 10 tags, each 1–40 characters.');
 if(!Array.isArray(data.checklist)||data.checklist.length!==CHECKLIST.length||data.checklist.some(v=>typeof v!=='boolean'))throw new Error('Invalid checklist.');
 return {notes:data.notes,tags:[...new Set((data.tags as string[]).map(t=>t.trim().toLowerCase()))],checklist:data.checklist as boolean[]};
}
