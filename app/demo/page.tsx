import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AdvancedWorkspace } from '@/components/dashboard/advanced-workspace';
import { advancedDemo } from '@/data/advanced-demo';

export const metadata = { title: 'Interactive demo', description: 'Explore TradeMirror analytics, calendar and breakdowns with clearly labelled synthetic data. No login required.' };
export default function DemoPage() {
  return <>
    <header className="demo-intro">
      <div className="demo-intro-top"><h1>Explore your trading edge.</h1><Link href="/" className="demo-home-link"><ArrowLeft size={14}/>Home</Link></div>
      <p>See profit, losses and broker results with sample trades.</p>
      <div className="demo-intro-flow" aria-label="Get started with your own data"><span>For your own results</span><ol><li>Log in</li><li><ArrowRight size={12} aria-hidden="true"/>Import CSV</li><li><ArrowRight size={12} aria-hidden="true"/>Review results</li></ol></div>
    </header>
    <AdvancedWorkspace result={advancedDemo} demo/>
  </>;
}
