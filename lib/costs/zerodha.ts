import {decimal,exactUnits,tradingDate} from '../analytics/daily';
import type {Match} from '../analytics/matching';
export type BrokerStatement={broker:'ZERODHA';segment:'F&O';start:string;end:string;gross:string;charges:string;otherNet:string;unrealized:string;net:string;chargeItems:{label:string;amount:string}[];instruments:{symbol:string;gross:string}[]};
function validDate(value:unknown):value is string {return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;}
function amount(value:string|undefined){if(typeof value!=='string'||! /^-?\d{1,14}(?:\.\d{1,8})?$/.test(value))throw new Error('Report contains a missing or unsupported amount.');return decimal(exactUnits(value));}
export function parseZerodhaStatement(sheets:Map<string,Record<string,string>[]>):BrokerStatement{
 const inputRows=sheets.get('F&O');if(!inputRows)throw new Error('Use a Zerodha Console F&O P&L XLSX export. Other brokers/segments are not supported yet.');const rows=inputRows;
 const titles=rows.map(r=>r.B||'').filter(v=>v.startsWith('P&L Statement for F&O from '));if(titles.length!==1)throw new Error('The F&O statement period is missing or ambiguous.');const dates=titles[0].match(/^P&L Statement for F&O from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})$/);if(!dates)throw new Error('Unsupported statement period.');const [,start,end]=dates;for(const d of [start,end])if(!validDate(d))throw new Error('Invalid statement date.');if(start>end)throw new Error('Statement dates are reversed.');
 function summary(label:string){const found=rows.filter(r=>r.B===label&&r.C!==undefined&&r.C!=='');if(found.length!==1)throw new Error('Statement summary is missing or duplicated: '+label);return amount(found[0].C);}
 const charges=summary('Charges'),gross=summary('Realized P&L'),otherNet=summary('Other Credit & Debit'),unrealized=summary('Unrealized P&L');if(exactUnits(charges)<BigInt(0))throw new Error('Charges cannot be negative.');
 const head=rows.findIndex(r=>r.B==='Account Head'&&r.C==='Amount'),symbols=rows.findIndex(r=>r.B==='Symbol'&&r.G==='Realized P&L');if(head<0||symbols<=head)throw new Error('Expected charge and instrument sections are missing.');
 const chargeItems=rows.slice(head+1,symbols).filter(r=>r.B&&r.C).map(r=>({label:r.B,amount:amount(r.C)}));if(!chargeItems.length||chargeItems.length>100||new Set(chargeItems.map(r=>r.label)).size!==chargeItems.length||chargeItems.some(r=>exactUnits(r.amount)<BigInt(0)))throw new Error('Charge breakdown is unsupported.');const chargeTotal=chargeItems.reduce((total,r)=>total+exactUnits(r.amount),BigInt(0));if(chargeTotal!==exactUnits(charges))throw new Error(`Charge breakdown does not equal the statement total. Breakdown: INR ${decimal(chargeTotal)}; summary: INR ${charges}; breakdown minus summary: INR ${decimal(chargeTotal-exactUnits(charges))}. Download a fresh original F&O P&L export. This report has not been saved; totals are never adjusted automatically.`);
 const instruments=rows.slice(symbols+1).filter(r=>r.B&&r.G).map(r=>({symbol:r.B,gross:amount(r.G)}));if(!instruments.length||instruments.length>10000||new Set(instruments.map(r=>r.symbol)).size!==instruments.length)throw new Error('Instrument section is empty or contains duplicates.');if(instruments.reduce((n,r)=>n+exactUnits(r.gross),BigInt(0))!==exactUnits(gross))throw new Error('Instrument realized results do not equal the statement summary.');
 const other=sheets.get('Other Debits and Credits');
 if(otherNet!=='0'||other){
  const title=`Other Debits and Credits for FO from ${start} to ${end}`;
  if(!other||other.filter(r=>r.B?.startsWith('Other Debits and Credits for FO from ')).length!==1||!other.some(r=>r.B===title))throw new Error('Other debit/credit evidence is missing or ambiguous.');
  const headers=other.map((r,i)=>r.B==='Particulars'&&r.C==='Posting Date'&&r.D==='Debit'&&r.E==='Credit'?i:-1).filter(i=>i>=0);
  if(headers.length!==1)throw new Error('Unsupported other debit/credit section.');
  const ledger=other.slice(headers[0]+1).filter(r=>r.C||r.D||r.E);
  let total=BigInt(0);
  for(const r of ledger){
   if(!r.B?.trim()||!validDate(r.C)||r.C<start||r.C>end)throw new Error('Other ledger contains a missing or invalid posting date.');
   const debit=exactUnits(amount(r.D)),credit=exactUnits(amount(r.E));
   if(debit<BigInt(0)||credit<BigInt(0))throw new Error('Other ledger debit and credit amounts cannot be negative.');
   total+=credit-debit;
  }
  if(total!==exactUnits(otherNet))throw new Error('Other debit/credit details do not equal the summary.');
 }
 return validateStatement({broker:'ZERODHA',segment:'F&O',start,end,gross,charges,otherNet,unrealized,net:decimal(exactUnits(gross)-exactUnits(charges)+exactUnits(otherNet)),chargeItems,instruments});
}
export function reconcileStatement(statement:BrokerStatement,matches:Match[]){
 const included=matches.filter(m=>m.broker==='ZERODHA'&&tradingDate(m.exitTime)>=statement.start&&tradingDate(m.exitTime)<=statement.end);const actual=new Map<string,bigint>();for(const m of included)actual.set(m.symbol,(actual.get(m.symbol)||BigInt(0))+exactUnits(m.grossPnl));const expected=new Map(statement.instruments.map(r=>[r.symbol,exactUnits(r.gross)]));
 const differences=[...new Set([...actual.keys(),...expected.keys()])].sort().filter(symbol=>(actual.get(symbol)||BigInt(0))!==(expected.get(symbol)||BigInt(0))).map(symbol=>({symbol,importedGross:decimal(actual.get(symbol)||BigInt(0)),statementGross:decimal(expected.get(symbol)||BigInt(0)),difference:decimal((actual.get(symbol)||BigInt(0))-(expected.get(symbol)||BigInt(0))),source:!actual.has(symbol)?'statement-only' as const:!expected.has(symbol)?'import-only' as const:'both' as const}));const importedGross=decimal(included.reduce((n,m)=>n+exactUnits(m.grossPnl),BigInt(0)));return {importedGross,grossDifference:decimal(exactUnits(importedGross)-exactUnits(statement.gross)),slices:included.length,differences,aligned:included.length>0&&differences.length===0&&importedGross===statement.gross};
}
export function validateStatement(value:unknown):BrokerStatement{
 if(!value||typeof value!=='object')throw new Error('Stored statement is unsupported.');const s=value as BrokerStatement;
 if(s.broker!=='ZERODHA'||s.segment!=='F&O'||!validDate(s.start)||!validDate(s.end)||s.start>s.end||!Array.isArray(s.chargeItems)||!Array.isArray(s.instruments)||!s.chargeItems.length||!s.instruments.length||s.chargeItems.length>100||s.instruments.length>10000)throw new Error('Stored statement format is unsupported.');
 for(const key of ['gross','charges','otherNet','unrealized','net'] as const)amount(s[key]);
 if(exactUnits(s.charges)<BigInt(0)||new Set(s.chargeItems.map(row=>row?.label?.trim())).size!==s.chargeItems.length||new Set(s.instruments.map(row=>row?.symbol?.trim())).size!==s.instruments.length)throw new Error('Stored statement has negative charges or duplicate breakdown rows.');
 for(const row of s.chargeItems){if(!row||typeof row.label!=='string'||!row.label.trim()||row.label.length>500)throw new Error('Unsupported charge label.');if(exactUnits(amount(row.amount))<BigInt(0))throw new Error('Charge breakdown cannot contain negative amounts.');}
 for(const row of s.instruments){if(!row||typeof row.symbol!=='string'||!row.symbol.trim()||row.symbol.length>100)throw new Error('Unsupported instrument.');amount(row.gross);}
 if(s.chargeItems.reduce((n,r)=>n+exactUnits(r.amount),BigInt(0))!==exactUnits(s.charges)||s.instruments.reduce((n,r)=>n+exactUnits(r.gross),BigInt(0))!==exactUnits(s.gross)||decimal(exactUnits(s.gross)-exactUnits(s.charges)+exactUnits(s.otherNet))!==s.net)throw new Error('Stored statement totals are inconsistent.');return s;
}
