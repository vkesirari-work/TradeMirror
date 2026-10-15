import {reportSelection,reportSnapshot,validateSnapshot} from './snapshot';
import type {Snapshot} from './snapshot';
import type {Match} from '../analytics/matching';
export function currentPrintReport(matches:Match[],mode:unknown,date:unknown,demo:boolean){
 const selection=reportSelection(matches,mode,date);
 return validateSnapshot({...reportSnapshot(selection.rows,mode as 'daily'|'weekly',selection.date),scope:demo?'synthetic demo':'real imports only'});
}
export function frozenPrintReport(snapshot:unknown):Snapshot{
 const value=validateSnapshot(snapshot);
 if(value.scope!=='real imports only')throw new Error('A saved account snapshot must use real-import scope.');
 return value;
}
