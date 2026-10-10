'use client';
import {useState} from 'react';
import {ResponsiveContainer,BarChart,Bar,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip} from 'recharts';
import type {GrossDay} from '@/lib/analytics/daily';
export function AccountChart({days}:{days:GrossDay[]}){
 const [mode,setMode]=useState<'daily'|'cumulative'>('daily');
 const data=days.map(day=>({...day,value:Number(mode==='daily'?day.grossPnl:day.cumulativeGross)}));
 const tooltip=<Tooltip content={({active,payload})=>active&&payload?.length?<div className="card"><b>{payload[0].payload.date}</b><p>Gross ₹{mode==='daily'?payload[0].payload.grossPnl:payload[0].payload.cumulativeGross}</p><small>{payload[0].payload.slices} FIFO slices that day</small></div>:null}/>;
 const axes=<><CartesianGrid stroke="#293837" strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fill:'#91a2a1',fontSize:11}}/><YAxis tick={{fill:'#91a2a1',fontSize:11}} width={75}/>{tooltip}</>;
 return <><div className="tabs" role="tablist" aria-label="Gross P&L chart"><button role="tab" aria-selected={mode==='daily'} className={mode==='daily'?'selected':''} onClick={()=>setMode('daily')}>Daily gross</button><button role="tab" aria-selected={mode==='cumulative'} className={mode==='cumulative'?'selected':''} onClick={()=>setMode('cumulative')}>Cumulative gross</button></div>{days.length?<div style={{height:280,width:'100%'}} role="img" aria-label={`${mode} realized gross P&L over imported exit dates`}><ResponsiveContainer width="100%" height="100%">{mode==='daily'?<BarChart data={data}>{axes}<Bar dataKey="value" fill="#a7e6bf" radius={[4,4,0,0]}/></BarChart>:<LineChart data={data}>{axes}<Line type="linear" dataKey="value" stroke="#a7e6bf" strokeWidth={2} dot={days.length<30}/></LineChart>}</ResponsiveContainer></div>:<p>No matched exits yet.</p>}<details><summary>Exact daily values · IST</summary><div className="table-scroll"><table><thead><tr><th>Exit date</th><th>Gross P&L</th><th>Cumulative gross</th><th>FIFO slices</th></tr></thead><tbody>{days.map(day=><tr key={day.date}><td>{day.date}</td><td>₹{day.grossPnl}</td><td>₹{day.cumulativeGross}</td><td>{day.slices}</td></tr>)}</tbody></table></div></details></>;
}
