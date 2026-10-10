'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {AiPeriodReview} from './ai-review';
import {SavedReports,downloadJson} from './saved-reports';
import {reportSnapshot} from '@/lib/reports/snapshot';
import { Card, Metric, SectionTitle } from '@/components/ui/primitives';
import { reportPeriods } from '@/lib/analytics/advanced';
import { exactMoney } from '@/lib/analytics/format';
import { exportMatchedCsv } from '@/lib/analytics/export';
import type { Match } from '@/lib/analytics/matching';

export function AccountReports({ matches,demo=false }: { matches: Match[];demo?:boolean }) {
  const [mode, setMode] = useState<'daily' | 'weekly'>('weekly');
  const [selected, setSelected] = useState('');
  const periods = useMemo(() => reportPeriods(matches, mode), [matches, mode]);
  const current = periods.find(period => period.date === selected) || periods[0];
  function download() {
    if (!current) return;
    const url = URL.createObjectURL(new Blob([exportMatchedCsv(current.rows)], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `trademirror-${mode}-${current.date}.csv`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <>{!demo&&<p className="inline-notice">Have a broker P&L report? <Link className="text-link" href="/costs">Import charges and review statement net →</Link></p>}<div className="tabs" role="tablist" aria-label="Report period"><button role="tab" aria-selected={mode === 'daily'} className={mode === 'daily' ? 'selected' : ''} onClick={() => { setMode('daily'); setSelected(''); }}>Daily</button><button role="tab" aria-selected={mode === 'weekly'} className={mode === 'weekly' ? 'selected' : ''} onClick={() => { setMode('weekly'); setSelected(''); }}>Weekly</button></div>
    {current ? <><Card><SectionTitle title={mode === 'weekly' ? 'Week starting ' + current.date : current.date} subtitle="Gross review · grouped by IST exit date" action={<div className="action-row"><button className="button secondary" onClick={download}>Export report executions</button><button className="button secondary" onClick={()=>downloadJson({...reportSnapshot(current.rows,mode,current.date),scope:demo?'synthetic demo':'real imports only',exportedAt:new Date().toISOString()},`trademirror-report-${current.date}.json`)}>Download review JSON</button><button className="button secondary" onClick={()=>window.print()}>Print / PDF</button></div>}/><div className="metric-grid advanced-metrics"><Metric label="Gross P&L" value={exactMoney(current.summary.grossPnl)} note="Before broker charges"/><Metric label="Win rate" value={current.summary.winRate + '%'} note={`${current.summary.slices} FIFO matching slices`}/><Metric label="Profit factor" value={current.summary.profitFactor || (current.summary.wins ? 'No losses' : '—')} note="Gross profit ÷ gross loss"/><Metric label="Active exit days" value={String(current.summary.activeDays)} note={`${current.summary.greenDays} green / ${current.summary.redDays} red`}/></div><p className="fineprint">Net P&L awaits confirmed charges. This review is calculated from your currently saved history, rather than a finalized broker statement or a stored report snapshot.</p></Card>
    <Card><SectionTitle title="Review this period" subtitle="Questions for your journal, based on the recorded results"/><div className="review-prompts"><div><span>01 · RESULTS</span>{current.summary.wins} winning and {current.summary.losses} losing slices. Which entries followed your plan?</div><div><span>02 · TIMING</span>Average holding time was {current.summary.averageHoldMinutes} minutes. Did your exit reasons match your original plan?</div><div><span>03 · COSTS</span>Gross winning P&L {exactMoney(current.summary.grossProfit)} versus gross losses {exactMoney(current.summary.grossLoss)}. Reconcile charges before judging net results.</div></div></Card></> : <Card><SectionTitle title="No matched exits to report" subtitle="Save a tradebook to generate your daily and weekly gross reviews."/></Card>}
    <Card><AiPeriodReview key={mode+':'+(current?.date||'')} mode={mode} date={current?.date} demo={demo}/></Card>
    <Card><SavedReports mode={mode} date={current?.date} demo={demo}/></Card>
    <Card><SectionTitle title={mode === 'weekly' ? 'Weekly history' : 'Daily history'} subtitle="Choose a period to inspect its computed review"/><div className="table-scroll"><table><thead><tr><th>{mode === 'weekly' ? 'Week starting Monday' : 'Exit date'}</th><th>FIFO slices</th><th>Win rate</th><th>Gross P&L</th><th>Review</th></tr></thead><tbody>{periods.map(period => <tr key={period.date}><td>{period.date}</td><td>{period.summary.slices}</td><td>{period.summary.winRate}%</td><td className={period.summary.grossPnl.startsWith('-') ? 'negative' : 'positive'}>{exactMoney(period.summary.grossPnl)}</td><td><button className="text-button" aria-pressed={current?.date === period.date} onClick={() => setSelected(period.date)}>Open review</button></td></tr>)}</tbody></table></div></Card>
  </>;
}
