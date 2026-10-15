import type {Annotation} from './annotation';
import {validateAnnotation} from './annotation';
import type {Match} from '../analytics/matching';
export type ReviewEntry=Annotation&{slice_key:string;connection:'linked'|'unlinked';evidence:Match|null};
export function readReviewExport(raw:string):ReviewEntry[]{
 const data=JSON.parse(raw);
 if(data.format!=='trademirror-journal'||data.version!==1||!Array.isArray(data.annotations)||data.annotations.length>1000)throw new Error('Unsupported journal review.');
 return data.annotations.map((row:ReviewEntry)=>{validateAnnotation(row);if(!/^[a-f0-9]{64}$/.test(row.slice_key)||!['linked','unlinked'].includes(row.connection)||!Number.isSafeInteger(row.revision)||row.revision<1)throw new Error('Invalid saved journal evidence.');return row;});
}
export function filterReview(entries:ReviewEntry[],query:string,connection:string,tag:string){
 const term=query.trim().toLowerCase();return entries.filter(row=>(!connection||row.connection===connection)&&(!tag||row.tags.includes(tag))&&(!term||[row.notes,...row.tags,row.evidence?.symbol||''].join(' ').toLowerCase().includes(term)));
}
