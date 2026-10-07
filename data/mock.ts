import type { AIInsight, DailyMetrics, Trade } from '@/types';
const rows: [string, number, 'CE'|'PE', number, number, number, string, number][] = [
 ['NIFTY',25100,'CE',124,148,150,'09:24',14],['BANKNIFTY',56200,'PE',210,185,60,'10:08',22],['NIFTY',25050,'PE',96,118,150,'10:46',12],['SENSEX',82200,'CE',184,166,40,'12:18',31],['NIFTY',25150,'CE',88,103,150,'13:02',9],['BANKNIFTY',56400,'CE',156,139,60,'14:12',28],['NIFTY',25100,'PE',112,107,150,'14:42',18],['SENSEX',82100,'PE',145,153,40,'15:04',7]
];
export const trades: Trade[] = rows.map((r,i) => { const [instrument,strike,optionType,entry,exit,quantity,t,holdMinutes]=r; const start = new Date(`2026-10-07T${t}:00+05:30`); const grossPnl=(exit-entry)*quantity; const charges=[92,78,91,67,86,76,72,58][i]; return {id:`tm-${i+1}`,userId:'demo-user',broker:'ZERODHA',instrument,strike,optionType,side:'LONG',entry,exit,quantity,entryTime:start.toISOString(),exitTime:new Date(start.getTime()+holdMinutes*60000).toISOString(),holdMinutes,grossPnl,charges,netPnl:grossPnl-charges,session:t<'11:30'?'Morning':t<'14:00'?'Midday':'After 2 PM',reportStatus:'PROVISIONAL'}; });
export const today: DailyMetrics = {date:'2026-10-07',grossPnl:5480,charges:620,netPnl:4860,winRate:50,totalTrades:8,status:'PROVISIONAL',finalizedAt:null};
export const daily = [{date:'01 Oct',net:2140,cumulative:2140},{date:'02 Oct',net:-1180,cumulative:960},{date:'05 Oct',net:3620,cumulative:4580},{date:'06 Oct',net:1840,cumulative:6420},{date:'07 Oct',net:4860,cumulative:11280}];
export const summary = {netPnl:11280,grossPnl:14280,charges:3000,winRate:57.1,totalTrades:35,profitFactor:1.68,averageWinner:1393,averageLoser:-1105};
export const sessions = [{name:'Morning',pnl:10960,trades:15},{name:'Midday',pnl:2380,trades:9},{name:'After 2 PM',pnl:-2060,trades:11}];
export const instruments = [{name:'NIFTY',pnl:10180,winRate:67},{name:'BANKNIFTY',pnl:1820,winRate:50},{name:'SENSEX',pnl:-720,winRate:40}];
export const options = [{name:'CE',pnl:7340},{name:'PE',pnl:3940}];
export const insights: AIInsight[] = [
 {id:'1',category:'What you’re doing well',title:'Your mornings have an edge',body:'In this sample week, morning trades contributed ₹10,960 of net profit across 15 trades. Your results were more consistent in this session.',source:'SAMPLE',reportId:'week-1'},
 {id:'2',category:'Biggest mistakes',title:'Activity rises as results fade',body:'The final session accounts for 11 trades and a net loss of ₹2,060. Higher frequency coincides with weaker results; this does not establish a cause.',source:'SAMPLE',reportId:'week-1'},
 {id:'3',category:'Timing analysis',title:'Losing trades stay open longer',body:'Sample winning trades average 13 minutes. Losing trades average 26 minutes. Review your notes to understand what drove this difference.',source:'SAMPLE',reportId:'week-1'},
 {id:'4',category:'Instrument analysis',title:'NIFTY leads this week',body:'NIFTY contributed ₹10,180, while SENSEX contributed −₹720. These are observations from a small sample, not a forecast.',source:'SAMPLE',reportId:'week-1'},
 {id:'5',category:'CE vs PE analysis',title:'Both sides contributed',body:'CE trades contributed ₹7,340 and PE trades ₹3,940. Compare session and holding time before attributing results to option type.',source:'SAMPLE',reportId:'week-1'},
 {id:'6',category:'Risk behaviour',title:'Costs deserve a closer look',body:'Sample transaction costs total ₹3,000. Review repeat entries and position changes to understand their contribution to costs.',source:'SAMPLE',reportId:'week-1'},
 {id:'7',category:'Next session focus',title:'Make your process observable',body:'Record your intended holding period, planned risk, and reason for exiting. Review these notes alongside the session breakdown.',source:'SAMPLE',reportId:'week-1'}
];
export const discipline = [{name:'Risk discipline',score:82},{name:'Trade frequency',score:54},{name:'Timing',score:73},{name:'Exit discipline',score:63}];
