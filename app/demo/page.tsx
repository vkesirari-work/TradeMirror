import {tradingDate} from '@/lib/analytics/daily';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Layers, ShieldCheck } from 'lucide-react';
import { AdvancedWorkspace } from '@/components/dashboard/advanced-workspace';
import { advancedDemo } from '@/data/advanced-demo';

export const metadata = { title: 'Interactive demo', description: 'Explore TradeMirror analytics, calendar and breakdowns with clearly labelled synthetic data. No login required.' };
export default function DemoPage() {
  const dates=advancedDemo.matches.map(match=>tradingDate(match.exitTime)).sort();
  const format=(date:string)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
  const period=dates.length?`${format(dates[0])} – ${format(dates.at(-1)!)} · IST`:'No matched exits';
  return <>
    <header className="demo-intro">
      <div className="demo-intro-top"><h1>Your performance. A clearer picture.</h1><Link href="/" className="demo-home-link"><ArrowLeft size={14}/>Home</Link></div>
      <p>Explore the results behind every trading decision.</p>
      <ul className="demo-context" aria-label="Demo data scope"><li><ShieldCheck size={13}/>Synthetic data</li><li><Layers size={13}/>{advancedDemo.matches.length} matched slices</li><li><CalendarDays size={13}/>{period}</li></ul>
    </header>
    <AdvancedWorkspace result={advancedDemo} demo/>
  </>;
}
