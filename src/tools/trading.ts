import {
  PlaceOrderSchema,
  CancelOrderSchema,
  CancelAllOrdersSchema,
  PlaceOrderInput,
  CancelOrderInput,
  CancelAllOrdersInput,
} from '../types/mcp.js';
import { validateInput, validateSymbol, validateQuantity, validatePrice } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';
import { isTestnetEnabled } from '../config/binance.js';

function validateTestnetEnabled(): void {
  if (!isTestnetEnabled()) {
    throw new Error('Trading functions are only available in testnet mode. Set BINANCE_TESTNET=true');
  }
}

export const tradingTools = [
  {
    name: 'place_order',
    description: '下单交易（仅限测试网环境）',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
        side: {
          type: 'string',
          enum: ['BUY', 'SELL'],
          description: '买卖方向',
        },
        type: {
          type: 'string',
          enum: ['MARKET', 'LIMIT'],
          description: '订单类型',
        },
        quantity: {
          type: 'string',
          description: '数量',
        },
        price: {
          type: 'string',
          description: '价格，LIMIT订单必需',
        },
      },
      required: ['symbol', 'side', 'type', 'quantity'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      validateTestnetEnabled();
      
      const input = validateInput(PlaceOrderSchema, args);
      validateSymbol(input.symbol);
      validateQuantity(input.quantity);

      if (input.type === 'LIMIT' && !input.price) {
        throw new Error('Price is required for LIMIT orders');
      }

      if (input.price) {
        validatePrice(input.price);
      }

      try {
        const orderParams: any = {
          symbol: input.symbol,
          side: input.side,
          type: input.type,
          quantity: input.quantity,
        };

        if (input.type === 'LIMIT' && input.price) {
          orderParams.price = input.price;
          orderParams.timeInForce = 'GTC';
        }

        const orderResult = await binanceClient.order(orderParams);

        return {
          symbol: orderResult.symbol,
          orderId: orderResult.orderId,
          orderListId: orderResult.orderListId,
          clientOrderId: orderResult.clientOrderId,
          transactTime: orderResult.transactTime,
          price: orderResult.price,
          origQty: orderResult.origQty,
          executedQty: orderResult.executedQty,
          cummulativeQuoteQty: orderResult.cummulativeQuoteQty,
          status: orderResult.status,
          timeInForce: orderResult.timeInForce,
          type: orderResult.type,
          side: orderResult.side,
          fills: orderResult.fills || [],
          timestamp: Date.now(),
          testnet: true,
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'cancel_order',
    description: '取消指定订单（仅限测试网环境）',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
        orderId: {
          type: 'number',
          description: '订单ID',
        },
      },
      required: ['symbol', 'orderId'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      validateTestnetEnabled();
      
      const input = validateInput(CancelOrderSchema, args);
      validateSymbol(input.symbol);

      try {
        const cancelResult = await binanceClient.cancelOrder({
          symbol: input.symbol,
          orderId: input.orderId,
        });

        return {
          symbol: cancelResult.symbol,
          origClientOrderId: cancelResult.origClientOrderId,
          orderId: cancelResult.orderId,
          orderListId: cancelResult.orderListId,
          clientOrderId: cancelResult.clientOrderId,
          price: cancelResult.price,
          origQty: cancelResult.origQty,
          executedQty: cancelResult.executedQty,
          cummulativeQuoteQty: cancelResult.cummulativeQuoteQty,
          status: cancelResult.status,
          timeInForce: cancelResult.timeInForce,
          type: cancelResult.type,
          side: cancelResult.side,
          timestamp: Date.now(),
          testnet: true,
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'cancel_all_orders',
    description: '取消指定交易对所有挂单（仅限测试网环境）',
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
      validateTestnetEnabled();
      
      const input = validateInput(CancelAllOrdersSchema, args);
      validateSymbol(input.symbol);

      try {
        const cancelResults = await binanceClient.cancelOpenOrders({
          symbol: input.symbol,
        });

        return {
          symbol: input.symbol,
          cancelledOrders: Array.isArray(cancelResults) ? cancelResults.map((result: any) => ({
            symbol: result.symbol,
            origClientOrderId: result.origClientOrderId,
            orderId: result.orderId,
            orderListId: result.orderListId,
            clientOrderId: result.clientOrderId,
            price: result.price,
            origQty: result.origQty,
            executedQty: result.executedQty,
            cummulativeQuoteQty: result.cummulativeQuoteQty,
            status: result.status,
            timeInForce: result.timeInForce,
            type: result.type,
            side: result.side,
          })) : [cancelResults],
          count: Array.isArray(cancelResults) ? cancelResults.length : 1,
          timestamp: Date.now(),
          testnet: true,
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];