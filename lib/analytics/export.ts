import type {Match} from './matching';
function cell(value:string,numeric=false):string {
 // CSV quoting alone does not stop spreadsheet formula execution.
 const safe=!numeric&&/^[\s]*[=+@\-]/.test(value)?"'"+value:value;
 return '"'+safe.replaceAll('"','""')+'"';
}
export function exportMatchedCsv(matches:Match[]):string {
 const header=['instrument','broker','position_side','quantity','entry_price','exit_price','entry_time','exit_time','gross_pnl','entry_execution_id','exit_execution_id','costs_status'];
 return '\uFEFF'+header.map(v=>cell(v)).join(',')+'\r\n'+matches.map(m=>[cell(m.symbol),cell(m.broker),cell(m.side),cell(m.quantity,true),cell(m.entryPrice,true),cell(m.exitPrice,true),cell(m.entryTime),cell(m.exitTime),cell(m.grossPnl,true),cell(m.entryId),cell(m.exitId),cell('Charges and net P&L unavailable')].join(',')).join('\r\n');
}
