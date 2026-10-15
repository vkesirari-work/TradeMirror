import Link from 'next/link';
import { Shell } from '@/components/dashboard/shell';
export default function DemoLayout({children}:{children:React.ReactNode}){
 return <Shell><div className="demo-workspace-banner"><div><b>Demo · sample data</b><p>Explore freely. Your account data stays separate.</p></div><div className="demo-auth-actions"><Link className="button primary" href="/login">Log in →</Link><Link className="text-link" href="/signup">Create account</Link></div></div>{children}</Shell>;
}
