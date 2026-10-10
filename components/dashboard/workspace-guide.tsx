import Link from 'next/link';

export function WorkspaceGuide({name='trader',ready=false}:{name?:string;ready?:boolean}) {
 const steps=[
  {title:ready?'Check your saved history':'Explore before signing up',description:ready?'Your dashboard uses saved executions. Synthetic example rows are excluded by default. Check import history before adding another file.':'Try the dashboard, journal, reviews and fictional costs without login. Demo records never become your account history.',href:ready?'/import':'/demo',action:ready?'Check import history':'Open interactive demo'},
  {title:ready?'Journal your executions':'Import your tradebook',description:ready?'Open an instrument to inspect prices and times. Add your own notes, tags and plan checklist; these describe your decisions.':'Export Zerodha Console → Reports → Tradebook as CSV. Preview validates locally; Save executions persists accepted rows to your account.',href:ready?'/trades':'/import',action:ready?'Open journal':'Import my tradebook'},
  {title:'Review the gross result',description:'Choose a calendar day or daily/weekly report. FIFO slices can represent partial fills; they are not a count of whole trading positions.',href:ready?'/reports':'/demo/reports',action:ready?'Open my reports':'Explore sample reports'},
  {title:'Bring in broker costs',description:'Preview an original Zerodha F&O P&L XLSX, inspect totals and confirm ownership before saving. Statement net is separate from FIFO gross; mismatches remain visible.',href:ready?'/costs':'/demo/costs',action:ready?'Review my broker statement':'See fictional costs'},
  {title:'Keep a period review',description:'Save a report snapshot to freeze its current gross results. Reopen it from saved history. Computed review prompts need no paid API. Optional AI is disabled in this free edition.',href:ready?'/reports':'/demo/reports',action:ready?'Save a report snapshot':'Explore the report workflow'},
  {title:'Keep your own copy',description:'Download filtered executions from Trades, report JSON from Reports, and notes/tags/checklists/plan JSON from Settings. Journal export is not a full account backup; restore is not supported.',href:ready?'/settings':'/signup',action:ready?'Export my journal':'Create my workspace'},
 ];
 return <section className="workspace-guide" aria-labelledby="workspace-guide-title">
  <span className="eyebrow">{ready?'YOUR NEXT STEP':'START HERE'}</span>
  <h2 id="workspace-guide-title">{ready?'Turn your results into a review.':`Welcome, ${name}. Start with your tradebook.`}</h2>
  <p>{ready?'Follow your history from executions to costs, then keep a review you can revisit.':'Explore the demo, then use your own account to import, journal and review your history.'}</p>
  <ol className="guide-steps">{steps.map((step,index)=><li key={step.title}><span>{String(index+1).padStart(2,'0')}</span><h3>{step.title}</h3><p>{step.description}</p><Link href={step.href} className="text-link">{step.action} →</Link></li>)}</ol>
  <p className="fineprint">A preview does not save data. After saving executions, reopen the dashboard to see your imported history. Gross analytics require matched buys and sells; unmatched quantities stay visible. Charges are not allocated to individual matching slices or days.</p>
 </section>;
}
