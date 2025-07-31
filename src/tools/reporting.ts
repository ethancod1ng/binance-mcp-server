import { z } from 'zod';
import {
  ExportTradingHistorySchema,
  GeneratePerformanceReportSchema,
  ExportTaxReportSchema,
  GetProfitLossSummarySchema,
  GenerateMonthlyReportSchema,
  ExportTradingHistoryInput,
  GeneratePerformanceReportInput,
  ExportTaxReportInput,
  GetProfitLossSummaryInput,
  GenerateMonthlyReportInput,
} from '../types/mcp.js';
import { validateInput } from '../utils/validation.js';
import { logError } from '../utils/error-handling.js';

/**
 * 报告和数据导出工具类
 */
export class ReportingTools {
  constructor(private binanceClient: any) {}

  /**
   * 导出交易历史记录
   */
  async exportTradingHistory(input: any) {
    try {
      const { symbol, startTime, endTime, limit = 500, format = 'json' } = input;
      
      // 获取交易历史
      const trades = await this.binanceClient.myTrades({
        symbol,
        startTime,
        endTime,
        limit,
      });

      // 计算统计信息
      const totalTrades = trades.length;
      const totalCommission = trades.reduce((sum: number, trade: any) => 
        sum + parseFloat(trade.commission), 0);
      const totalVolume = trades.reduce((sum: number, trade: any) => 
        sum + parseFloat(trade.qty), 0);
      const totalQuoteVolume = trades.reduce((sum: number, trade: any) => 
        sum + parseFloat(trade.quoteQty), 0);

      const report = {
        symbol,
        period: {
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
        },
        summary: {
          totalTrades,
          totalVolume: totalVolume.toFixed(8),
          totalQuoteVolume: totalQuoteVolume.toFixed(2),
          totalCommission: totalCommission.toFixed(8),
          avgTradeSize: totalTrades > 0 ? (totalVolume / totalTrades).toFixed(8) : '0',
        },
        trades: format === 'detailed' ? trades.map((trade: any) => ({
          id: trade.id,
          orderId: trade.orderId,
          price: trade.price,
          qty: trade.qty,
          quoteQty: trade.quoteQty,
          commission: trade.commission,
          commissionAsset: trade.commissionAsset,
          time: new Date(trade.time).toISOString(),
          isBuyer: trade.isBuyer,
          isMaker: trade.isMaker,
        })) : [],
        exportTime: new Date().toISOString(),
        format,
      };

      return report;
    } catch (error) {
      logError(error as Error);
      throw error;
    }
  }

  /**
   * 生成绩效报告
   */
  async generatePerformanceReport(input: any) {
    try {
      const { symbols, startTime, endTime, includeUnrealized = true } = input;
      
      const reports = [];
      
      for (const symbol of symbols) {
        // 获取交易历史
        const trades = await this.binanceClient.myTrades({
          symbol,
          startTime,
          endTime,
          limit: 1000,
        });

        // 计算已实现盈亏
        let realizedPnL = 0;
        let totalBuyVolume = 0;
        let totalSellVolume = 0;
        let totalBuyValue = 0;
        let totalSellValue = 0;
        let position = 0;
        let avgBuyPrice = 0;

        for (const trade of trades) {
          const qty = parseFloat(trade.qty);
          const price = parseFloat(trade.price);
          const value = qty * price;

          if (trade.isBuyer) {
            totalBuyVolume += qty;
            totalBuyValue += value;
            position += qty;
            avgBuyPrice = totalBuyValue / totalBuyVolume;
          } else {
            totalSellVolume += qty;
            totalSellValue += value;
            position -= qty;
            // 计算已实现盈亏
            realizedPnL += (price - avgBuyPrice) * qty;
          }
        }

        // 获取当前价格计算未实现盈亏
        let unrealizedPnL = 0;
        if (includeUnrealized && position > 0) {
          const ticker = await this.binanceClient.prices({ symbol });
          const currentPrice = parseFloat(ticker[symbol]);
          unrealizedPnL = (currentPrice - avgBuyPrice) * position;
        }

        const totalPnL = realizedPnL + unrealizedPnL;
        const totalInvested = totalBuyValue;
        const roi = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

        reports.push({
          symbol,
          performance: {
            realizedPnL: realizedPnL.toFixed(2),
            unrealizedPnL: unrealizedPnL.toFixed(2),
            totalPnL: totalPnL.toFixed(2),
            roi: roi.toFixed(2) + '%',
            totalInvested: totalInvested.toFixed(2),
          },
          trading: {
            totalTrades: trades.length,
            buyTrades: trades.filter((t: any) => t.isBuyer).length,
            sellTrades: trades.filter((t: any) => !t.isBuyer).length,
            totalBuyVolume: totalBuyVolume.toFixed(8),
            totalSellVolume: totalSellVolume.toFixed(8),
            avgBuyPrice: avgBuyPrice.toFixed(8),
            currentPosition: position.toFixed(8),
          },
        });
      }

      return {
        period: {
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
        },
        summary: {
          totalSymbols: symbols.length,
          totalRealizedPnL: reports.reduce((sum, r) => sum + parseFloat(r.performance.realizedPnL), 0).toFixed(2),
          totalUnrealizedPnL: reports.reduce((sum, r) => sum + parseFloat(r.performance.unrealizedPnL), 0).toFixed(2),
          totalPnL: reports.reduce((sum, r) => sum + parseFloat(r.performance.totalPnL), 0).toFixed(2),
        },
        symbolReports: reports,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logError(error as Error);
      throw error;
    }
  }

  /**
   * 导出税务报告
   */
  async exportTaxReport(input: any) {
    try {
      const { year, symbols, country = 'US', includeStaking = false } = input;
      
      const startTime = new Date(`${year}-01-01`).getTime();
      const endTime = new Date(`${year}-12-31T23:59:59`).getTime();
      
      const taxEvents = [];
      
      for (const symbol of symbols) {
        const trades = await this.binanceClient.myTrades({
          symbol,
          startTime,
          endTime,
          limit: 1000,
        });

        for (const trade of trades) {
          taxEvents.push({
            date: new Date(trade.time).toISOString().split('T')[0],
            type: trade.isBuyer ? 'BUY' : 'SELL',
            symbol,
            quantity: trade.qty,
            price: trade.price,
            value: trade.quoteQty,
            fee: trade.commission,
            feeAsset: trade.commissionAsset,
            orderId: trade.orderId,
            tradeId: trade.id,
          });
        }
      }

      // 按日期排序
      taxEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 计算税务汇总
      const totalBuyValue = taxEvents
        .filter(e => e.type === 'BUY')
        .reduce((sum, e) => sum + parseFloat(e.value), 0);
      
      const totalSellValue = taxEvents
        .filter(e => e.type === 'SELL')
        .reduce((sum, e) => sum + parseFloat(e.value), 0);
      
      const totalFees = taxEvents
        .reduce((sum, e) => sum + parseFloat(e.fee), 0);

      return {
        taxYear: year,
        country,
        summary: {
          totalEvents: taxEvents.length,
          totalBuyValue: totalBuyValue.toFixed(2),
          totalSellValue: totalSellValue.toFixed(2),
          totalFees: totalFees.toFixed(8),
          netGainLoss: (totalSellValue - totalBuyValue).toFixed(2),
        },
        events: taxEvents,
        disclaimer: 'This report is for informational purposes only. Please consult a tax professional for tax advice.',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logError(error as Error);
      throw error;
    }
  }

  /**
   * 获取盈亏汇总
   */
  async getProfitLossSummary(input: any) {
    try {
      const { symbols, period = '30d' } = input;
      
      // 计算时间范围
      const endTime = Date.now();
      let startTime;
      
      switch (period) {
        case '7d':
          startTime = endTime - 7 * 24 * 60 * 60 * 1000;
          break;
        case '30d':
          startTime = endTime - 30 * 24 * 60 * 60 * 1000;
          break;
        case '90d':
          startTime = endTime - 90 * 24 * 60 * 60 * 1000;
          break;
        case '1y':
          startTime = endTime - 365 * 24 * 60 * 60 * 1000;
          break;
        default:
          startTime = endTime - 30 * 24 * 60 * 60 * 1000;
      }

      const summaries = [];
      
      for (const symbol of symbols) {
        const trades = await this.binanceClient.myTrades({
          symbol,
          startTime,
          endTime,
          limit: 1000,
        });

        let realizedPnL = 0;
        let totalVolume = 0;
        let totalFees = 0;
        let winningTrades = 0;
        let losingTrades = 0;
        let position = 0;
        let avgCost = 0;
        let totalCost = 0;

        for (const trade of trades) {
          const qty = parseFloat(trade.qty);
          const price = parseFloat(trade.price);
          const fee = parseFloat(trade.commission);
          
          totalVolume += qty;
          totalFees += fee;

          if (trade.isBuyer) {
            position += qty;
            totalCost += qty * price;
            avgCost = position > 0 ? totalCost / position : 0;
          } else {
            const pnl = (price - avgCost) * qty;
            realizedPnL += pnl;
            position -= qty;
            
            if (pnl > 0) winningTrades++;
            else if (pnl < 0) losingTrades++;
          }
        }

        // 获取当前价格计算未实现盈亏
        let unrealizedPnL = 0;
        if (position > 0) {
          const ticker = await this.binanceClient.prices({ symbol });
          const currentPrice = parseFloat(ticker[symbol]);
          unrealizedPnL = (currentPrice - avgCost) * position;
        }

        const winRate = (winningTrades + losingTrades) > 0 ? 
          (winningTrades / (winningTrades + losingTrades)) * 100 : 0;

        summaries.push({
          symbol,
          realizedPnL: realizedPnL.toFixed(2),
          unrealizedPnL: unrealizedPnL.toFixed(2),
          totalPnL: (realizedPnL + unrealizedPnL).toFixed(2),
          totalVolume: totalVolume.toFixed(8),
          totalFees: totalFees.toFixed(8),
          trades: trades.length,
          winningTrades,
          losingTrades,
          winRate: winRate.toFixed(2) + '%',
          currentPosition: position.toFixed(8),
          avgCost: avgCost.toFixed(8),
        });
      }

      return {
        period,
        timeRange: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
        overall: {
          totalRealizedPnL: summaries.reduce((sum, s) => sum + parseFloat(s.realizedPnL), 0).toFixed(2),
          totalUnrealizedPnL: summaries.reduce((sum, s) => sum + parseFloat(s.unrealizedPnL), 0).toFixed(2),
          totalPnL: summaries.reduce((sum, s) => sum + parseFloat(s.totalPnL), 0).toFixed(2),
          totalFees: summaries.reduce((sum, s) => sum + parseFloat(s.totalFees), 0).toFixed(8),
          totalTrades: summaries.reduce((sum, s) => sum + s.trades, 0),
        },
        symbols: summaries,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logError(error as Error);
      throw error;
    }
  }

  /**
   * 生成月度报告
   */
  async generateMonthlyReport(input: any) {
    try {
      const { year, month, symbols } = input;
      
      const startTime = new Date(year, month - 1, 1).getTime();
      const endTime = new Date(year, month, 0, 23, 59, 59).getTime();
      
      const monthlyData = [];
      
      for (const symbol of symbols) {
        const trades = await this.binanceClient.myTrades({
          symbol,
          startTime,
          endTime,
          limit: 1000,
        });

        // 按日分组统计
        const dailyStats: { [key: string]: any } = {};
        
        for (const trade of trades) {
          const date = new Date(trade.time).toISOString().split('T')[0];
          
          if (!dailyStats[date]) {
            dailyStats[date] = {
              trades: 0,
              volume: 0,
              value: 0,
              fees: 0,
              buyTrades: 0,
              sellTrades: 0,
            };
          }
          
          dailyStats[date].trades++;
          dailyStats[date].volume += parseFloat(trade.qty);
          dailyStats[date].value += parseFloat(trade.quoteQty);
          dailyStats[date].fees += parseFloat(trade.commission);
          
          if (trade.isBuyer) {
            dailyStats[date].buyTrades++;
          } else {
            dailyStats[date].sellTrades++;
          }
        }

        const totalTrades = trades.length;
        const totalVolume = trades.reduce((sum: number, t: any) => sum + parseFloat(t.qty), 0);
        const totalValue = trades.reduce((sum: number, t: any) => sum + parseFloat(t.quoteQty), 0);
        const totalFees = trades.reduce((sum: number, t: any) => sum + parseFloat(t.commission), 0);
        
        monthlyData.push({
          symbol,
          summary: {
            totalTrades,
            totalVolume: totalVolume.toFixed(8),
            totalValue: totalValue.toFixed(2),
            totalFees: totalFees.toFixed(8),
            avgTradeSize: totalTrades > 0 ? (totalVolume / totalTrades).toFixed(8) : '0',
            tradingDays: Object.keys(dailyStats).length,
          },
          dailyBreakdown: Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            ...stats,
            volume: stats.volume.toFixed(8),
            value: stats.value.toFixed(2),
            fees: stats.fees.toFixed(8),
          })),
        });
      }

      return {
        period: {
          year,
          month,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        },
        summary: {
          totalSymbols: symbols.length,
          totalTrades: monthlyData.reduce((sum, d) => sum + d.summary.totalTrades, 0),
          totalValue: monthlyData.reduce((sum, d) => sum + parseFloat(d.summary.totalValue), 0).toFixed(2),
          totalFees: monthlyData.reduce((sum, d) => sum + parseFloat(d.summary.totalFees), 0).toFixed(8),
          activeTradingDays: Math.max(...monthlyData.map(d => d.summary.tradingDays)),
        },
        symbolData: monthlyData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logError(error as Error);
      throw error;
    }
  }
}

// 导出工具定义
export const reportingTools = [
  {
    name: 'export_trading_history',
    description: '导出指定交易对的交易历史记录，支持时间范围筛选和多种导出格式',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: '交易对符号，如 BTCUSDT',
        },
        startTime: {
          type: 'number',
          description: '开始时间戳（毫秒）',
        },
        endTime: {
          type: 'number',
          description: '结束时间戳（毫秒）',
        },
        limit: {
          type: 'number',
          description: '记录数量限制，默认500',
          default: 500,
        },
        format: {
          type: 'string',
          enum: ['json', 'detailed'],
          description: '导出格式',
          default: 'json',
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(ExportTradingHistorySchema, args);
      const tools = new ReportingTools(binanceClient);
      return await tools.exportTradingHistory(input);
    },
  },
  {
    name: 'generate_performance_report',
    description: '生成多个交易对的绩效分析报告，包括已实现和未实现盈亏、ROI等指标',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'array',
          items: { type: 'string' },
          description: '交易对符号数组，如 ["BTCUSDT", "ETHUSDT"]',
        },
        startTime: {
          type: 'number',
          description: '开始时间戳（毫秒）',
        },
        endTime: {
          type: 'number',
          description: '结束时间戳（毫秒）',
        },
        includeUnrealized: {
          type: 'boolean',
          description: '是否包含未实现盈亏',
          default: true,
        },
      },
      required: ['symbols'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GeneratePerformanceReportSchema, args);
      const tools = new ReportingTools(binanceClient);
      return await tools.generatePerformanceReport(input);
    },
  },
  {
    name: 'export_tax_report',
    description: '导出指定年度的税务报告，包含所有交易事件和税务汇总信息',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: '税务年度，如 2024',
        },
        symbols: {
          type: 'array',
          items: { type: 'string' },
          description: '交易对符号数组',
        },
        country: {
          type: 'string',
          description: '国家代码，默认US',
          default: 'US',
        },
        includeStaking: {
          type: 'boolean',
          description: '是否包含质押收益',
          default: false,
        },
      },
      required: ['year', 'symbols'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(ExportTaxReportSchema, args);
      const tools = new ReportingTools(binanceClient);
      return await tools.exportTaxReport(input);
    },
  },
  {
    name: 'get_profit_loss_summary',
    description: '获取指定时间段内的盈亏汇总，包括胜率、交易统计等关键指标',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'array',
          items: { type: 'string' },
          description: '交易对符号数组',
        },
        period: {
          type: 'string',
          enum: ['7d', '30d', '90d', '1y'],
          description: '统计周期',
          default: '30d',
        },
      },
      required: ['symbols'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetProfitLossSummarySchema, args);
      const tools = new ReportingTools(binanceClient);
      return await tools.getProfitLossSummary(input);
    },
  },
  {
    name: 'generate_monthly_report',
    description: '生成指定月份的详细交易报告，包含每日交易统计和月度汇总',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: '年份，如 2024',
        },
        month: {
          type: 'number',
          minimum: 1,
          maximum: 12,
          description: '月份，1-12',
        },
        symbols: {
          type: 'array',
          items: { type: 'string' },
          description: '交易对符号数组',
        },
      },
      required: ['year', 'month', 'symbols'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GenerateMonthlyReportSchema, args);
      const tools = new ReportingTools(binanceClient);
      return await tools.generateMonthlyReport(input);
    },
  },
];