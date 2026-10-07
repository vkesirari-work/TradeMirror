import type { Broker, BrokerConnection, DailyMetrics, Order, Trade, User } from '@/types';
export interface BrokerPosition { instrument: string; quantity: number; averagePrice: number }
export interface BrokerAdapter {
  broker: Broker;
  connect(userId: string): Promise<{ authorizationUrl: string }>;
  disconnect(connectionId: string): Promise<void>;
  getOrders(connection: BrokerConnection): Promise<Order[]>;
  getTrades(connection: BrokerConnection): Promise<Trade[]>;
  getPositions(connection: BrokerConnection): Promise<BrokerPosition[]>;
  getProfile(connection: BrokerConnection): Promise<Pick<User, 'id' | 'name'>>;
  syncDailyTrades(connection: BrokerConnection, date: string): Promise<{ trades: Trade[]; metrics: DailyMetrics; finalDataAvailable: boolean }>;
}
// Future adapters belong in ./adapters. No API credentials or broker implementation in phase one.
