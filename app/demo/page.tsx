import Link from 'next/link';
import { AdvancedWorkspace } from '@/components/dashboard/advanced-workspace';
import { advancedDemo } from '@/data/advanced-demo';

export const metadata = { title: 'Interactive demo', description: 'Explore TradeMirror analytics, calendar and breakdowns with clearly labelled synthetic data. No login required.' };
export default function DemoPage() {
  return <>
    <div className="page-heading"><div><span className="eyebrow">TRY TRADEMIRROR</span><h1>See where you win.</h1><p>Track profit, losses and broker performance. Login → import CSV → see your results.</p></div><Link href="/" className="button secondary">Home</Link></div>
    <AdvancedWorkspace result={advancedDemo} demo/>
  </>;
}
