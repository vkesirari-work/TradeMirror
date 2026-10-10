import type {Match} from '../analytics/matching';
import {advancedSummary} from '../analytics/advanced';
import {sliceIdentity} from './annotation';
export function strategyReview(matches:Match[],tags:Record<string,string[]>) {
 const groups=new Map<string,Match[]>();let tagged=0;
 for(const match of matches){const labels=[...new Set(tags[sliceIdentity(match)]||[])];if(labels.length)tagged++;for(const label of labels){const rows=groups.get(label)||[];rows.push(match);groups.set(label,rows);}}
 return {tagged,untagged:matches.length-tagged,groups:[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([tag,rows])=>({tag,summary:advancedSummary(rows)}))};
}
export function annotationStatus(keys:string[],current:Set<string>,full:Set<string>){
 let linked=0,outsideScope=0,unlinked=0;for(const key of new Set(keys)){if(current.has(key))linked++;else if(full.has(key))outsideScope++;else unlinked++;}return {linked,outsideScope,unlinked};
}
