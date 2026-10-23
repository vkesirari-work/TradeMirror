'use client';
import {useState} from 'react';
import {StatementDetail} from './cost-statements';
import type {BrokerStatement} from '@/lib/costs/zerodha';
import type {Match} from '@/lib/analytics/matching';
export function DemoCostComparison({statement,matches}:{statement:BrokerStatement;matches:Match[]}){
 const [missing,setMissing]=useState(false);const omitted=matches[0]?.symbol;
 return <><div role="group" aria-label="Reconciliation example" className="action-row"><button className="button secondary" aria-pressed={!missing} onClick={()=>setMissing(false)}>Complete history</button><button className="button secondary" aria-pressed={missing} onClick={()=>setMissing(true)}>Missing history example</button></div><p className="fineprint">{missing?`Hypothetical example: imported matches for ${omitted} are omitted; the fictional statement stays unchanged.`:'All synthetic instrument results match the fictional statement. Switch examples to see how missing history is reported.'}</p><StatementDetail demo statement={statement} matches={missing?matches.filter(m=>m.symbol!==omitted):matches}/></>;
}
