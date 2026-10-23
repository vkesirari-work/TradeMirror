import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {validateSnapshot,type Snapshot} from './snapshot';
import {displayMoney} from '../analytics/format';
const money=(value:string)=>displayMoney(value).replace('₹','INR ').replace('−','-');
export async function reportPdf(input:Snapshot,savedAt?:string){
 const report=validateSnapshot(input),s=report.summary;
 const doc=await PDFDocument.create();const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 doc.setTitle(`TradeMirror ${report.mode} review ${report.period}`);doc.setAuthor('TradeMirror');doc.setSubject(report.scope==='synthetic demo'?'Synthetic demo - illustrative data':'Private account trading review');
 let page=doc.addPage([595.28,841.89]),y=797;const left=42,width=511,ink=rgb(.13,.22,.29),muted=rgb(.34,.42,.47),teal=rgb(.14,.42,.43);
 function room(height:number){if(y-height<52){page=doc.addPage([595.28,841.89]);y=797;}}
 function text(value:string,size=10,font=regular,color=ink){
  const words=value.split(/\s+/);let line='';
  for(const word of words){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)>width&&line){room(size+6);page.drawText(line,{x:left,y,size,font,color});y-=size+5;line=word;}else line=next;}
  if(line){room(size+6);page.drawText(line,{x:left,y,size,font,color});y-=size+5;}
 }
 text('TRADEMIRROR',11,bold,teal);y-=8;text(report.mode==='weekly'?'Weekly trading review':'Daily trading review',25,bold);text(`${report.mode==='weekly'?'Week starting Monday':'Exit date'}: ${report.period} | INR | IST`,10,regular,muted);
 text(report.scope==='synthetic demo'?'SYNTHETIC DEMO - illustrative values; no personal account data.':'PRIVATE ACCOUNT - real imports only; synthetic examples excluded.',9,bold,teal);
 text(savedAt?`Frozen saved snapshot. Saved: ${savedAt}. Later imports do not change this evidence.`:'Current history review. Values are rebuilt when downloaded; refresh after new imports.',9,regular,muted);y-=12;
 const metrics=[['Realized gross P&L',money(s.grossPnl)],['FIFO matching slices',String(s.slices)],['Win rate',s.winRate+'%'],['Gross profit factor',s.profitFactor||'Unavailable'],['Gross winning P&L',money(s.grossProfit)],['Gross losses',money(s.grossLoss)],['Average holding time',s.averageHoldMinutes===null?'Unavailable':s.averageHoldMinutes+' min'],['Max realized gross drawdown',money(s.maxDrawdown)]];
 for(let i=0;i<metrics.length;i+=2){room(61);for(let j=0;j<2;j++){const [label,value]=metrics[i+j],x=left+j*262;page.drawRectangle({x,y:y-48,width:249,height:56,color:rgb(.94,.96,.97)});page.drawText(label,{x:x+12,y:y-7,size:9,font:regular,color:muted});const size=Math.min(20,225/bold.widthOfTextAtSize(value,1));page.drawText(value,{x:x+12,y:y-32,size,font:bold,color:ink});}y-=65;}
 text(`${s.wins} winning | ${s.losses} losing | ${s.breakeven} breakeven slices. Slices are partial fills, not whole positions.`,9,regular,muted);y-=9;text('Daily exit-date evidence',13,bold);
 const cols=[left,left+140,left+245,left+380];room(26);['IST exit date','Slices','Gross P&L','Cumulative gross'].forEach((v,i)=>page.drawText(v,{x:cols[i],y,size:9,font:bold,color:muted}));y-=21;
 for(const day of s.days){room(24);[day.date,String(day.slices),money(day.grossPnl),money(day.cumulativeGross)].forEach((value,i)=>{const size=Math.min(10,125/regular.widthOfTextAtSize(value,1));page.drawText(value,{x:cols[i],y,size,font:regular,color:ink});});page.drawLine({start:{x:left,y:y-8},end:{x:left+width,y:y-8},thickness:.5,color:rgb(.82,.87,.89)});y-=25;}
 y-=8;text('Scope and limits',12,bold);text('Net P&L is unavailable in this execution review. Broker statement net is separate; charges are not allocated to slices or days. Drawdown follows closed-slice gross results from zero, not account capital or intratrade risk.',9,regular,muted);text(report.limits,9,regular,muted);text('Computed user review. Not a broker-certified statement, AI advice or prediction. Display amounts round to two decimals; exact financial evidence remains available in JSON/CSV.',9,regular,muted);
 const pages=doc.getPages();for(let i=0;i<pages.length;i++)pages[i].drawText(`TradeMirror | ${report.scope==='synthetic demo'?'Synthetic demo':'Private account'} | ${i+1} / ${pages.length}`,{x:left,y:28,size:8,font:regular,color:muted});
 return doc.save();
}
