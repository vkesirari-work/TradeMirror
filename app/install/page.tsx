import {InstallPanel} from '@/components/pwa/install-panel';
import {Logo} from '@/components/dashboard/shell';
export default function Install(){return <main className="main-content" style={{maxWidth:800,margin:'auto'}}><Logo/><div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE, ONE TAP AWAY</span><h1>Install TradeMirror.</h1><p>No app-store account or paid plan required.</p></div></div><InstallPanel/></main>;}
