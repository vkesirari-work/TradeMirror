'use client';
import {DownloadLink} from '@/components/download-link';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {SavedReports} from './saved-reports';
import { Card, Metric, SectionTitle } from '@/components/ui/primitives';
import { reportPeriods } from '@/lib/analytics/advanced';
import { displayMoney as exactMoney } from '@/lib/analytics/format';
import type { Match } from '@/lib/analytics/matching';

export function AccountReports({ matches,demo=false }: { matches: Match[];demo?:boolean }) {
  const [mode, setMode] = useState<'daily' | 'weekly'>('weekly');
  const [selected, setSelected] = useState('');
  const periods = useMemo(() => reportPeriods(matches, mode), [matches, mode]);
  const current = periods.find(period => period.date === selected) || periods[0];
  function downloadHref(format:'json'|'csv') {
    const query=new URLSearchParams({mode,date:current?.date||'',format});
    if(demo)query.set('demo','1');
    return '/api/exports/report?'+query.toString();
  }
  return <>{!demo&&<p className="inline-notice">Have a broker P&L report? <Link className="text-link" href="/costs">Import charges and review statement net →</Link></p>}<div className="tabs" role="tablist" aria-label="Report period"><button role="tab" aria-selected={mode === 'daily'} className={mode === 'daily' ? 'selected' : ''} onClick={() => { setMode('daily'); setSelected(''); }}>Daily</button><button role="tab" aria-selected={mode === 'weekly'} className={mode === 'weekly' ? 'selected' : ''} onClick={() => { setMode('weekly'); setSelected(''); }}>Weekly</button></div>
    {current ? <><div id="current-period-review"><Card><SectionTitle title={mode === 'weekly' ? 'Week starting ' + current.date : current.date} subtitle="Gross review · grouped by IST exit date" action={<div className="action-row"><DownloadLink href={downloadHref('csv')}>Export report executions</DownloadLink><DownloadLink href={downloadHref('json')}>Download review JSON</DownloadLink><a className="button secondary" href={'/print/report?'+new URLSearchParams({mode,date:current.date,...(demo?{demo:'1'}:{})}).toString()}>Print / PDF</a></div>}/><div className="metric-grid advanced-metrics"><Metric label="Gross P&L" positive={!current.summary.grossPnl.startsWith('-')} value={exactMoney(current.summary.grossPnl)} note="Before broker charges"/><Metric label="Win rate" value={current.summary.winRate + '%'} note={`${current.summary.slices} FIFO matching slices`}/><Metric label="Profit factor" value={current.summary.profitFactor || (current.summary.wins ? 'No losses' : '—')} note="Gross profit ÷ gross loss"/><Metric label="Active exit days" value={String(current.summary.activeDays)} note={`${current.summary.greenDays} green / ${current.summary.redDays} red`}/></div><p className="fineprint">Net P&L awaits confirmed charges. This review is calculated from your currently saved history, rather than a finalized broker statement or a stored report snapshot. Downloads rebuild the selected period from current history; refresh the report after importing new data.</p></Card></div>
    <Card><SectionTitle title="Review this period" subtitle="Free computed review · grounded in recorded results"/><div className="review-prompts"><div><span>01 · RESULTS</span>{current.summary.wins} winning and {current.summary.losses} losing slices. Which entries followed your plan?</div><div><span>02 · TIMING</span>Average holding time was {current.summary.averageHoldMinutes} minutes. Did your exit reasons match your original plan?</div><div><span>03 · COSTS</span>Gross winning P&L {exactMoney(current.summary.grossProfit)} versus gross losses {exactMoney(current.summary.grossLoss)}. Reconcile charges before judging net results.</div></div><p className="fineprint">These prompts are calculated from your recorded metrics. No AI API key or paid provider request is needed; your review stays within TradeMirror.</p></Card></> : <Card><SectionTitle title="No matched exits to report" subtitle="Save a tradebook to generate your daily and weekly gross reviews."/></Card>}
    <Card><SavedReports mode={mode} date={current?.date} demo={demo}/></Card>
    <Card><SectionTitle title={mode === 'weekly' ? 'Weekly history' : 'Daily history'} subtitle="Choose a period to inspect its computed review"/><div className="table-scroll"><table><thead><tr><th>{mode === 'weekly' ? 'Week starting Monday' : 'Exit date'}</th><th>FIFO slices</th><th>Win rate</th><th>Gross P&L</th><th>Review</th></tr></thead><tbody>{periods.map(period => <tr key={period.date}><td>{period.date}</td><td>{period.summary.slices}</td><td>{period.summary.winRate}%</td><td className={period.summary.grossPnl.startsWith('-') ? 'negative' : 'positive'}>{exactMoney(period.summary.grossPnl)}</td><td><button className="text-button" aria-pressed={current?.date === period.date} onClick={() => {setSelected(period.date);requestAnimationFrame(()=>document.getElementById('current-period-review')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}));}}>Open review</button></td></tr>)}</tbody></table></div></Card>
  </>;
}
