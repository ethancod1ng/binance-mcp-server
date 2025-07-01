import {
  GetAccountInfoSchema,
  GetOpenOrdersSchema,
  GetOrderHistorySchema,
} from '../types/mcp.js';
import { validateInput, validateSymbol } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';

export const accountTools = [
  {
    name: 'get_account_info',
    description: '获取账户信息和余额',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async (binanceClient: any, args: unknown) => {
      validateInput(GetAccountInfoSchema, args);

      try {
        const accountInfo = await binanceClient.accountInfo();
        
        return {
          makerCommission: accountInfo.makerCommission,
          takerCommission: accountInfo.takerCommission,
          buyerCommission: accountInfo.buyerCommission,
          sellerCommission: accountInfo.sellerCommission,
          canTrade: accountInfo.canTrade,
          canWithdraw: accountInfo.canWithdraw,
          canDeposit: accountInfo.canDeposit,
          updateTime: accountInfo.updateTime,
          accountType: accountInfo.accountType,
          permissions: accountInfo.permissions,
          balances: accountInfo.balances
            .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
            .map((balance: any) => ({
              asset: balance.asset,
              free: balance.free,
              locked: balance.locked,
              total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString(),
            })),
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_open_orders',
    description: '获取当前挂单',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '特定交易对的挂单，不传则获取所有挂单',
        },
      },
      required: [],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetOpenOrdersSchema, args);
      
      if (input.symbol) {
        validateSymbol(input.symbol);
      }

      try {
        const openOrders = await binanceClient.openOrders(
          input.symbol ? { symbol: input.symbol } : {}
        );

        return {
          symbol: input.symbol || 'ALL',
          orders: openOrders.map((order: any) => ({
            symbol: order.symbol,
            orderId: order.orderId,
            orderListId: order.orderListId,
            clientOrderId: order.clientOrderId,
            price: order.price,
            origQty: order.origQty,
            executedQty: order.executedQty,
            cummulativeQuoteQty: order.cummulativeQuoteQty,
            status: order.status,
            timeInForce: order.timeInForce,
            type: order.type,
            side: order.side,
            stopPrice: order.stopPrice,
            icebergQty: order.icebergQty,
            time: order.time,
            updateTime: order.updateTime,
            isWorking: order.isWorking,
            origQuoteOrderQty: order.origQuoteOrderQty,
          })),
          count: openOrders.length,
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_order_history',
    description: '获取历史订单记录',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
        limit: {
          type: 'number',
          description: '数量限制，默认500',
          default: 500,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetOrderHistorySchema, args);
      validateSymbol(input.symbol);

      try {
        const orderHistory = await binanceClient.allOrders({
          symbol: input.symbol,
          limit: input.limit,
        });

        return {
          symbol: input.symbol,
          orders: orderHistory.map((order: any) => ({
            symbol: order.symbol,
            orderId: order.orderId,
            orderListId: order.orderListId,
            clientOrderId: order.clientOrderId,
            price: order.price,
            origQty: order.origQty,
            executedQty: order.executedQty,
            cummulativeQuoteQty: order.cummulativeQuoteQty,
            status: order.status,
            timeInForce: order.timeInForce,
            type: order.type,
            side: order.side,
            stopPrice: order.stopPrice,
            icebergQty: order.icebergQty,
            time: order.time,
            updateTime: order.updateTime,
            isWorking: order.isWorking,
            origQuoteOrderQty: order.origQuoteOrderQty,
          })),
          count: orderHistory.length,
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];