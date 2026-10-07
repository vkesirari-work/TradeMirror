export type ReportStatus = 'PROVISIONAL' | 'FINAL';
export type Broker = 'ZERODHA' | 'DHAN' | 'UPSTOX' | 'ANGEL_ONE' | 'GROWW';
export type TradingSession = 'Morning' | 'Midday' | 'After 2 PM';
export interface User { id: string; email: string; name: string }
export interface BrokerConnection { id: string; userId: string; broker: Broker; status: 'CONNECTED' | 'DISCONNECTED'; lastSyncedAt: string | null }
export interface Order { id: string; userId: string; broker: Broker; instrument: string; side: 'BUY' | 'SELL'; quantity: number; price: number; executedAt: string; rawDataId?: string }
export interface Trade { id: string; userId: string; broker: Broker; instrument: string; strike: number; optionType: 'CE' | 'PE'; side: 'LONG' | 'SHORT'; entry: number; exit: number; quantity: number; entryTime: string; exitTime: string; holdMinutes: number; grossPnl: number; charges: number; netPnl: number; session: TradingSession; reportStatus: ReportStatus; rawDataId?: string; notes?: string }
export interface TradeMetrics { tradeId: string; mfe: number | null; mae: number | null; plannedStopLoss: number | null; plannedTarget: number | null; earlyExit: boolean | null; stopLossViolation: boolean | null }
export interface DailyMetrics { date: string; grossPnl: number; charges: number; netPnl: number; winRate: number; totalTrades: number; status: ReportStatus; finalizedAt: string | null }
export interface WeeklyMetrics { startDate: string; endDate: string; netPnl: number; charges: number; winRate: number; profitFactor: number; averageHold: number; totalTrades: number }
export interface AIInsight { id: string; category: string; title: string; body: string; source: 'SAMPLE' | 'AI'; reportId: string }
