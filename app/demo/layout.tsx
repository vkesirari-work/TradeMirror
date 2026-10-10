import Link from 'next/link';
import { Shell } from '@/components/dashboard/shell';
export default function DemoLayout({children}:{children:React.ReactNode}){
 return <Shell><div className="demo-workspace-banner"><div><b>Interactive demo · synthetic data</b><p>No login required. All views use 48 illustrative FIFO slices; no real account data is loaded or saved.</p></div><Link className="button primary" href="/signup">Analyse your own history →</Link></div>{children}</Shell>;
}
