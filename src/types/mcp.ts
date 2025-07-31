import { z } from 'zod';

export const GetPriceSchema = z.object({
  symbol: z.string().describe('交易对符号，如 BTCUSDT'),
});

export const GetOrderBookSchema = z.object({
  symbol: z.string().describe('交易对符号，如 BTCUSDT'),
  limit: z.number().optional().default(100).describe('深度限制，默认100'),
});

export const GetKlinesSchema = z.object({
  symbol: z.string().describe('交易对符号，如 BTCUSDT'),
  interval: z.enum(['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M']).describe('时间间隔'),
  limit: z.number().optional().default(500).describe('数量限制，默认500'),
});

export const Get24hrTickerSchema = z.object({
  symbol: z.string().optional().describe('交易对符号，不传则获取所有交易对'),
});

export const GetAccountInfoSchema = z.object({});

export const GetOpenOrdersSchema = z.object({
  symbol: z.string().optional().describe('特定交易对的挂单'),
});

export const GetOrderHistorySchema = z.object({
  symbol: z.string().describe('交易对符号'),
  limit: z.number().optional().default(500).describe('数量限制，默认500'),
});

export const PlaceOrderSchema = z.object({
  symbol: z.string().describe('交易对符号'),
  side: z.enum(['BUY', 'SELL']).describe('买卖方向'),
  type: z.enum(['MARKET', 'LIMIT']).describe('订单类型'),
  quantity: z.string().describe('数量'),
  price: z.string().optional().describe('价格，LIMIT单必需'),
});

export const CancelOrderSchema = z.object({
  symbol: z.string().describe('交易对符号'),
  orderId: z.number().describe('订单ID'),
});

export const CancelAllOrdersSchema = z.object({
  symbol: z.string().describe('交易对符号'),
});

// 技术指标相关Schema
export const GetTechnicalIndicatorSchema = z.object({
  symbol: z.string().describe('交易对符号，如 BTCUSDT'),
  interval: z.enum(['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M']).optional().default('1d').describe('时间间隔'),
  limit: z.number().optional().default(100).describe('获取K线数量'),
  period: z.number().optional().describe('计算周期'),
  fast_period: z.number().optional().describe('快线周期'),
  slow_period: z.number().optional().describe('慢线周期'),
  signal_period: z.number().optional().describe('信号线周期'),
  std_dev: z.number().optional().describe('标准差倍数'),
  periods: z.array(z.number()).optional().describe('计算周期数组'),
  type: z.enum(['SMA', 'EMA']).optional().describe('移动平均线类型'),
  lookback: z.number().optional().describe('回看周期'),
});

export type GetPriceInput = z.infer<typeof GetPriceSchema>;
export type GetOrderBookInput = z.infer<typeof GetOrderBookSchema>;
export type GetKlinesInput = z.infer<typeof GetKlinesSchema>;
export type Get24hrTickerInput = z.infer<typeof Get24hrTickerSchema>;
export type GetAccountInfoInput = z.infer<typeof GetAccountInfoSchema>;
export type GetOpenOrdersInput = z.infer<typeof GetOpenOrdersSchema>;
export type GetOrderHistoryInput = z.infer<typeof GetOrderHistorySchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;
export type CancelAllOrdersInput = z.infer<typeof CancelAllOrdersSchema>;

// 技术指标相关类型
export type GetRSIInput = z.infer<typeof GetTechnicalIndicatorSchema>;
export type GetMACDInput = z.infer<typeof GetTechnicalIndicatorSchema>;
export type GetBollingerBandsInput = z.infer<typeof GetTechnicalIndicatorSchema>;
export type GetMovingAverageInput = z.infer<typeof GetTechnicalIndicatorSchema>;
export type GetSupportResistanceInput = z.infer<typeof GetTechnicalIndicatorSchema>;