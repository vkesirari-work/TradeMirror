'use client';
import { useEffect, useRef } from 'react';
import type { Match } from '@/lib/analytics/matching';
import { exactMoney } from '@/lib/analytics/format';

export function MatchedDetail({ match, onClose }: { match: Match; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const timestamp = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  const holding = ((Date.parse(match.exitTime) - Date.parse(match.entryTime)) / 60000).toFixed(1);
  return <dialog ref={dialog} className="match-dialog" aria-labelledby="match-dialog-title" onClose={onClose} onCancel={onClose}>
    <div className="spread"><span className="eyebrow">FIFO MATCHING SLICE</span><button className="button secondary" onClick={() => dialog.current?.close()}>Close details</button></div>
    <h2 id="match-dialog-title">{match.symbol}</h2><p>{match.side} · {match.quantity} quantity · {match.broker}</p>
    <strong className={`match-detail-pnl ${match.grossPnl.startsWith('-') ? 'negative' : 'positive'}`}>{exactMoney(match.grossPnl)}</strong><p>Realized gross P&L · before charges</p>
    <dl className="detail-list">{[
      ['Entry price', exactMoney(match.entryPrice)], ['Exit price', exactMoney(match.exitPrice)],
      ['Entry time', timestamp(match.entryTime)], ['Exit time', timestamp(match.exitTime)], ['Holding time', holding + ' minutes'],
      ['Entry execution identity', match.entryId], ['Exit execution identity', match.exitId],
    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <p className="fineprint">One FIFO slice may be part of a larger position. Charges, net P&L, planned stops/targets and intratrade market prices are unavailable. Source identities are preserved for reconciliation.</p>
  </dialog>;
}
