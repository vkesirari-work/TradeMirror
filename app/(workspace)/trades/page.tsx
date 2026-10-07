import Link from 'next/link';
import { Upload } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { TradeTable } from '@/components/trades/table';
export default function Trades(){return <><div className="page-heading"><div><span className="eyebrow">YOUR EXECUTION HISTORY</span><h1>Trade journal.</h1><p>A closer look at each decision. Sample trades · 7 October 2026.</p></div><Link className="button primary" href="/import"><Upload size={16}/>Import trades</Link></div><Card className="table-card"><TradeTable/></Card></>;}
