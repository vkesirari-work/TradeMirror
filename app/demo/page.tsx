import Link from 'next/link';
import { ArrowLeft, CalendarDays, Layers, ShieldCheck } from 'lucide-react';
import { AdvancedWorkspace } from '@/components/dashboard/advanced-workspace';
import { advancedDemo } from '@/data/advanced-demo';

export const metadata = { title: 'Interactive demo', description: 'Explore TradeMirror analytics, calendar and breakdowns with clearly labelled synthetic data. No login required.' };
export default function DemoPage() {
  return <>
    <header className="demo-intro">
      <div className="demo-intro-top"><h1>Performance overview.</h1><Link href="/" className="demo-home-link"><ArrowLeft size={14}/>Home</Link></div>
      <p>Understand your results. Find what’s working.</p>
      <ul className="demo-context" aria-label="Demo data scope"><li><ShieldCheck size={13}/>Synthetic data</li><li><Layers size={13}/>{advancedDemo.matches.length} matched slices</li><li><CalendarDays size={13}/>September 2026 · IST</li></ul>
    </header>
    <AdvancedWorkspace result={advancedDemo} demo/>
  </>;
}
