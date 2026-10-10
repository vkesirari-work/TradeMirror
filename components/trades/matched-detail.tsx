'use client';
import { useEffect, useRef, useState } from 'react';
import type { Match } from '@/lib/analytics/matching';
import type {Annotation} from '@/lib/journal/annotation';
import type {PlanTemplate} from '@/lib/journal/plan';
import { JournalEditor } from './journal-editor';
import { exactMoney } from '@/lib/analytics/format';

export function MatchedDetail({ match, onClose, demo=false,plan,initialAnnotation,onSaved }: {plan?:PlanTemplate;initialAnnotation?:Annotation;onSaved?:(data:Annotation)=>void; match: Match; onClose: () => void; demo?:boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [dirty,setDirty]=useState(false);const [confirmClose,setConfirmClose]=useState(false);
  const requestClose=()=>{if(dirty)setConfirmClose(true);else dialog.current?.close();};
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const timestamp = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const holding = ((Date.parse(match.exitTime) - Date.parse(match.entryTime)) / 60000).toFixed(1);
  return <dialog ref={dialog} className="match-dialog" aria-labelledby="match-dialog-title" onClose={onClose} onCancel={event=>{event.preventDefault();requestClose();}}>
    <div className="spread"><span className="eyebrow">FIFO MATCHING SLICE</span><button className="button secondary" onClick={requestClose}>Close details</button></div>
    {confirmClose&&<div className="inline-notice" role="alert"><p>You have an unsaved draft. Keep editing or discard it before closing.</p><button className="button secondary" onClick={()=>setConfirmClose(false)}>Keep editing</button> <button className="button secondary" onClick={()=>dialog.current?.close()}>Discard draft and close</button></div>}
    <h2 id="match-dialog-title">{match.symbol}</h2><p>{match.side} · {match.quantity} quantity · {match.broker}</p>
    <strong className={`match-detail-pnl ${match.grossPnl.startsWith('-') ? 'negative' : 'positive'}`}>{exactMoney(match.grossPnl)}</strong><p>Realized gross P&L · before charges</p>
    <dl className="detail-list">{[
      ['Entry price', exactMoney(match.entryPrice)], ['Exit price', exactMoney(match.exitPrice)],
      ['Entry time', timestamp(match.entryTime)], ['Exit time', timestamp(match.exitTime)], ['Holding time', holding + ' minutes'],
      ['Entry execution identity', match.entryId], ['Exit execution identity', match.exitId],
    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <JournalEditor match={match} demo={demo} plan={plan} initialAnnotation={initialAnnotation} onSaved={onSaved} onDirtyChange={setDirty}/>
    <p className="fineprint">One FIFO slice may be part of a larger position. Charges, net P&L, planned stops/targets and intratrade market prices are unavailable. Source identities are preserved for reconciliation.</p>
  </dialog>;
}
