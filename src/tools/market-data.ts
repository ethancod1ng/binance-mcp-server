import {
  GetPriceSchema,
  GetOrderBookSchema,
  GetKlinesSchema,
  Get24hrTickerSchema,
  GetPriceInput,
  GetOrderBookInput,
  GetKlinesInput,
  Get24hrTickerInput,
} from '../types/mcp.js';
import { validateInput, validateSymbol } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';

export const marketDataTools = [
  {
    name: 'get_price',
    description: '获取指定交易对的当前价格',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetPriceSchema, args);
      validateSymbol(input.symbol);

      try {
        const price = await binanceClient.prices({ symbol: input.symbol });
        return {
          symbol: input.symbol,
          price: price[input.symbol],
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_orderbook',
    description: '获取订单簿深度数据',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
        limit: {
          type: 'number',
          description: '深度限制，默认100',
          default: 100,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetOrderBookSchema, args);
      validateSymbol(input.symbol);

      try {
        const orderBook = await binanceClient.book({
          symbol: input.symbol,
          limit: input.limit,
        });

        return {
          symbol: input.symbol,
          lastUpdateId: orderBook.lastUpdateId,
          bids: orderBook.bids.slice(0, input.limit).map((bid: any) => ({
            price: bid.price,
            quantity: bid.quantity,
          })),
          asks: orderBook.asks.slice(0, input.limit).map((ask: any) => ({
            price: ask.price,
            quantity: ask.quantity,
          })),
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_klines',
    description: '获取K线历史数据',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
        interval: {
          type: 'string',
          enum: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'],
          description: '时间间隔',
        },
        limit: {
          type: 'number',
          description: '数量限制，默认500',
          default: 500,
        },
      },
      required: ['symbol', 'interval'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetKlinesSchema, args);
      validateSymbol(input.symbol);

      try {
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval,
          limit: input.limit,
        });

        return {
          symbol: input.symbol,
          interval: input.interval,
          data: klines.map((kline: any) => ({
            openTime: kline.openTime,
            open: kline.open,
            high: kline.high,
            low: kline.low,
            close: kline.close,
            volume: kline.volume,
            closeTime: kline.closeTime,
            quoteAssetVolume: kline.quoteAssetVolume,
            numberOfTrades: kline.numberOfTrades,
            takerBuyBaseAssetVolume: kline.takerBuyBaseAssetVolume,
            takerBuyQuoteAssetVolume: kline.takerBuyQuoteAssetVolume,
          })),
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_24hr_ticker',
    description: '获取24小时价格变动统计',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，不传则获取所有交易对',
        },
      },
      required: [],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(Get24hrTickerSchema, args);
      
      if (input.symbol) {
        validateSymbol(input.symbol);
      }

      try {
        if (input.symbol) {
          const ticker = await binanceClient.dailyStats({ symbol: input.symbol });
          return {
            symbol: input.symbol,
            data: ticker,
            timestamp: Date.now(),
          };
        } else {
          const tickers = await binanceClient.dailyStats();
          return {
            data: Array.isArray(tickers) ? tickers : [tickers],
            timestamp: Date.now(),
          };
        }
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];