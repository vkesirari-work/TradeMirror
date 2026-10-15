import Link from 'next/link';
import { Shell } from '@/components/dashboard/shell';
export default function DemoLayout({children}:{children:React.ReactNode}){
 return <Shell><div className="demo-experience"><div className="demo-workspace-banner"><div><b>Interactive demo</b><p>Sample data · no login needed</p></div><div className="demo-auth-actions"><Link className="button primary" href="/login">Log in →</Link><Link className="text-link" href="/signup">Create account</Link></div></div>{children}</div></Shell>;
}
