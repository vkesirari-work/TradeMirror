import { AccountReports } from '@/components/reports/account-reports';
import { advancedDemo } from '@/data/advanced-demo';
export default function DemoReports(){return <><div className="page-heading"><div><span className="eyebrow">SYNTHETIC PERFORMANCE HISTORY</span><h1>Explore your reviews.</h1><p>Daily and weekly gross reports from illustrative matching slices.</p></div></div><AccountReports matches={advancedDemo.matches}/></>;}
