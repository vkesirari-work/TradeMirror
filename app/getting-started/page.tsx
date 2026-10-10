import Link from 'next/link';
import { WorkspaceGuide } from '@/components/dashboard/workspace-guide';
export const metadata={title:'Getting started'};
export default function GettingStarted(){return <main className="main-content"><Link className="text-link" href="/">TradeMirror · Back to website</Link><WorkspaceGuide/><p className="fineprint">Importing your own history requires a signed-in account. <Link href="/login">Log in</Link> or <Link href="/signup">create your account</Link>.</p></main>;}
