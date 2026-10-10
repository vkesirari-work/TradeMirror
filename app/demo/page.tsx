import Link from 'next/link';
import { AdvancedWorkspace } from '@/components/dashboard/advanced-workspace';
import { advancedDemo } from '@/data/advanced-demo';

export const metadata = { title: 'Interactive demo', description: 'Explore TradeMirror analytics, calendar and breakdowns with clearly labelled synthetic data. No login required.' };
export default function DemoPage() {
  return <>
    <div className="page-heading"><div><span className="eyebrow">EXPLORE YOUR NEXT TRADING WORKSPACE</span><h1>Your trading, decoded.</h1><p>Try the calendar, scope filters and performance breakdowns. Gross results only; no real account data.</p></div><Link href="/" className="button secondary">Back to website</Link></div>
    <AdvancedWorkspace result={advancedDemo} demo/>
  </>;
}
