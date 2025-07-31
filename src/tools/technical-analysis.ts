import {
  GetTechnicalIndicatorSchema,
  GetRSIInput,
  GetMACDInput,
  GetBollingerBandsInput,
  GetMovingAverageInput,
  GetSupportResistanceInput,
} from '../types/mcp.js';
import { validateInput, validateSymbol } from '../utils/validation.js';
import { handleBinanceError } from '../utils/error-handling.js';

// 技术指标计算函数
class TechnicalIndicators {
  // 计算RSI
  static calculateRSI(prices: number[], period: number = 14): number[] {
    if (prices.length < period + 1) return [];
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    // 计算价格变化
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const rsiValues: number[] = [];
    
    // 计算初始平均值
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
    
    // 计算第一个RSI值
    let rs = avgGain / avgLoss;
    rsiValues.push(100 - (100 / (1 + rs)));
    
    // 计算后续RSI值
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      rs = avgGain / avgLoss;
      rsiValues.push(100 - (100 / (1 + rs)));
    }
    
    return rsiValues;
  }
  
  // 计算移动平均线
  static calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b);
      sma.push(sum / period);
    }
    return sma;
  }
  
  // 计算指数移动平均线
  static calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // 第一个EMA值使用SMA
    ema.push(prices.slice(0, period).reduce((a, b) => a + b) / period);
    
    // 计算后续EMA值
    for (let i = period; i < prices.length; i++) {
      ema.push((prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier)));
    }
    
    return ema;
  }
  
  // 计算MACD
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    // 计算MACD线
    const macdLine: number[] = [];
    const startIndex = slowPeriod - fastPeriod;
    
    for (let i = 0; i < fastEMA.length - startIndex; i++) {
      macdLine.push(fastEMA[i + startIndex] - slowEMA[i]);
    }
    
    // 计算信号线
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    
    // 计算柱状图
    const histogram: number[] = [];
    const signalStartIndex = signalPeriod - 1;
    
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(macdLine[i + signalStartIndex] - signalLine[i]);
    }
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }
  
  // 计算布林带
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period);
    const upperBand: number[] = [];
    const lowerBand: number[] = [];
    
    for (let i = 0; i < sma.length; i++) {
      const dataIndex = i + period - 1;
      const slice = prices.slice(dataIndex - period + 1, dataIndex + 1);
      const mean = sma[i];
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upperBand.push(mean + (stdDev * standardDeviation));
      lowerBand.push(mean - (stdDev * standardDeviation));
    }
    
    return {
      upper: upperBand,
      middle: sma,
      lower: lowerBand
    };
  }
  
  // 识别支撑阻力位
  static findSupportResistance(highs: number[], lows: number[], lookback: number = 20) {
    const supports: number[] = [];
    const resistances: number[] = [];
    
    for (let i = lookback; i < lows.length - lookback; i++) {
      const currentLow = lows[i];
      const currentHigh = highs[i];
      
      // 检查是否为支撑位（局部最低点）
      let isSupport = true;
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && lows[j] < currentLow) {
          isSupport = false;
          break;
        }
      }
      if (isSupport) supports.push(currentLow);
      
      // 检查是否为阻力位（局部最高点）
      let isResistance = true;
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && highs[j] > currentHigh) {
          isResistance = false;
          break;
        }
      }
      if (isResistance) resistances.push(currentHigh);
    }
    
    return {
      supports: [...new Set(supports)].sort((a, b) => b - a),
      resistances: [...new Set(resistances)].sort((a, b) => a - b)
    };
  }
}

export const technicalAnalysisTools = [
  {
    name: 'get_rsi',
    description: '计算RSI相对强弱指数',
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
          default: '1d',
        },
        period: {
          type: 'number',
          description: 'RSI计算周期，默认14',
          default: 14,
        },
        limit: {
          type: 'number',
          description: '获取K线数量，默认100',
          default: 100,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetTechnicalIndicatorSchema, args) as GetRSIInput;
      validateSymbol(input.symbol);

      try {
        // 获取K线数据
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval || '1d',
          limit: input.limit || 100,
        });

        // 提取收盘价
        const closePrices = klines.map((kline: any) => parseFloat(kline.close));
        
        // 计算RSI
        const rsiValues = TechnicalIndicators.calculateRSI(closePrices, input.period || 14);
        const currentRSI = rsiValues[rsiValues.length - 1];
        
        // RSI解读
        let signal = 'NEUTRAL';
        let description = '中性区域';
        
        if (currentRSI > 70) {
          signal = 'OVERBOUGHT';
          description = '超买区域，可能面临回调压力';
        } else if (currentRSI < 30) {
          signal = 'OVERSOLD';
          description = '超卖区域，可能出现反弹机会';
        }

        return {
          symbol: input.symbol,
          indicator: 'RSI',
          period: input.period || 14,
          interval: input.interval || '1d',
          current_value: currentRSI,
          signal: signal,
          description: description,
          values: rsiValues.slice(-20), // 返回最近20个值
          interpretation: {
            overbought_threshold: 70,
            oversold_threshold: 30,
            current_level: currentRSI > 70 ? 'overbought' : currentRSI < 30 ? 'oversold' : 'neutral'
          },
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_macd',
    description: '计算MACD指标',
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
          default: '1d',
        },
        fast_period: {
          type: 'number',
          description: '快线周期，默认12',
          default: 12,
        },
        slow_period: {
          type: 'number',
          description: '慢线周期，默认26',
          default: 26,
        },
        signal_period: {
          type: 'number',
          description: '信号线周期，默认9',
          default: 9,
        },
        limit: {
          type: 'number',
          description: '获取K线数量，默认100',
          default: 100,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetTechnicalIndicatorSchema, args) as GetMACDInput;
      validateSymbol(input.symbol);

      try {
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval || '1d',
          limit: input.limit || 100,
        });

        const closePrices = klines.map((kline: any) => parseFloat(kline.close));
        
        const macdData = TechnicalIndicators.calculateMACD(
          closePrices,
          input.fast_period || 12,
          input.slow_period || 26,
          input.signal_period || 9
        );
        
        const currentMACD = macdData.macd[macdData.macd.length - 1];
        const currentSignal = macdData.signal[macdData.signal.length - 1];
        const currentHistogram = macdData.histogram[macdData.histogram.length - 1];
        
        // MACD信号判断
        let signal = 'NEUTRAL';
        let description = '观望';
        
        if (currentMACD > currentSignal && currentHistogram > 0) {
          signal = 'BULLISH';
          description = 'MACD线在信号线上方，看涨信号';
        } else if (currentMACD < currentSignal && currentHistogram < 0) {
          signal = 'BEARISH';
          description = 'MACD线在信号线下方，看跌信号';
        }

        return {
          symbol: input.symbol,
          indicator: 'MACD',
          interval: input.interval || '1d',
          parameters: {
            fast_period: input.fast_period || 12,
            slow_period: input.slow_period || 26,
            signal_period: input.signal_period || 9,
          },
          current_values: {
            macd: currentMACD,
            signal: currentSignal,
            histogram: currentHistogram,
          },
          signal: signal,
          description: description,
          recent_data: {
            macd: macdData.macd.slice(-10),
            signal: macdData.signal.slice(-10),
            histogram: macdData.histogram.slice(-10),
          },
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_bollinger_bands',
    description: '计算布林带指标',
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
          default: '1d',
        },
        period: {
          type: 'number',
          description: '计算周期，默认20',
          default: 20,
        },
        std_dev: {
          type: 'number',
          description: '标准差倍数，默认2',
          default: 2,
        },
        limit: {
          type: 'number',
          description: '获取K线数量，默认100',
          default: 100,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetTechnicalIndicatorSchema, args) as GetBollingerBandsInput;
      validateSymbol(input.symbol);

      try {
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval || '1d',
          limit: input.limit || 100,
        });

        const closePrices = klines.map((kline: any) => parseFloat(kline.close));
        const currentPrice = closePrices[closePrices.length - 1];
        
        const bbData = TechnicalIndicators.calculateBollingerBands(
          closePrices,
          input.period || 20,
          input.std_dev || 2
        );
        
        const currentUpper = bbData.upper[bbData.upper.length - 1];
        const currentMiddle = bbData.middle[bbData.middle.length - 1];
        const currentLower = bbData.lower[bbData.lower.length - 1];
        
        // 布林带信号判断
        let signal = 'NEUTRAL';
        let description = '价格在布林带中轨附近';
        let position = 'MIDDLE';
        
        const upperDistance = ((currentPrice - currentUpper) / currentUpper) * 100;
        const lowerDistance = ((currentPrice - currentLower) / currentLower) * 100;
        
        if (currentPrice >= currentUpper) {
          signal = 'OVERBOUGHT';
          description = '价格触及或突破上轨，可能超买';
          position = 'UPPER';
        } else if (currentPrice <= currentLower) {
          signal = 'OVERSOLD';
          description = '价格触及或跌破下轨，可能超卖';
          position = 'LOWER';
        } else if (currentPrice > currentMiddle) {
          signal = 'BULLISH';
          description = '价格在中轨上方，偏向看涨';
          position = 'UPPER_HALF';
        } else {
          signal = 'BEARISH';
          description = '价格在中轨下方，偏向看跌';
          position = 'LOWER_HALF';
        }

        return {
          symbol: input.symbol,
          indicator: 'BOLLINGER_BANDS',
          interval: input.interval || '1d',
          parameters: {
            period: input.period || 20,
            std_dev: input.std_dev || 2,
          },
          current_price: currentPrice,
          current_bands: {
            upper: currentUpper,
            middle: currentMiddle,
            lower: currentLower,
          },
          position: position,
          signal: signal,
          description: description,
          analysis: {
            bandwidth: ((currentUpper - currentLower) / currentMiddle) * 100,
            price_position: ((currentPrice - currentLower) / (currentUpper - currentLower)) * 100,
            distance_to_upper: upperDistance,
            distance_to_lower: lowerDistance,
          },
          recent_data: {
            upper: bbData.upper.slice(-10),
            middle: bbData.middle.slice(-10),
            lower: bbData.lower.slice(-10),
          },
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_moving_averages',
    description: '计算移动平均线',
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
          default: '1d',
        },
        periods: {
          type: 'array',
          items: { type: 'number' },
          description: '计算周期数组，如 [5, 10, 20, 50]',
          default: [5, 10, 20, 50],
        },
        type: {
          type: 'string',
          enum: ['SMA', 'EMA'],
          description: '移动平均线类型：SMA(简单)或EMA(指数)',
          default: 'SMA',
        },
        limit: {
          type: 'number',
          description: '获取K线数量，默认100',
          default: 100,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetTechnicalIndicatorSchema, args) as GetMovingAverageInput;
      validateSymbol(input.symbol);

      try {
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval || '1d',
          limit: input.limit || 100,
        });

        const closePrices = klines.map((kline: any) => parseFloat(kline.close));
        const currentPrice = closePrices[closePrices.length - 1];
        const periods = input.periods || [5, 10, 20, 50];
        const type = input.type || 'SMA';
        
        const movingAverages: any = {};
        const signals: any = {};
        
        periods.forEach(period => {
          if (type === 'SMA') {
            const sma = TechnicalIndicators.calculateSMA(closePrices, period);
            movingAverages[`${type}${period}`] = sma[sma.length - 1];
          } else {
            const ema = TechnicalIndicators.calculateEMA(closePrices, period);
            movingAverages[`${type}${period}`] = ema[ema.length - 1];
          }
          
          // 判断价格与均线的关系
          const maValue = movingAverages[`${type}${period}`];
          if (currentPrice > maValue) {
            signals[`${type}${period}`] = 'ABOVE';
          } else {
            signals[`${type}${period}`] = 'BELOW';
          }
        });
        
        // 整体趋势判断
        const aboveCount = Object.values(signals).filter(s => s === 'ABOVE').length;
        const totalCount = periods.length;
        
        let overallTrend = 'NEUTRAL';
        if (aboveCount === totalCount) {
          overallTrend = 'STRONG_BULLISH';
        } else if (aboveCount > totalCount * 0.7) {
          overallTrend = 'BULLISH';
        } else if (aboveCount < totalCount * 0.3) {
          overallTrend = 'BEARISH';
        } else if (aboveCount === 0) {
          overallTrend = 'STRONG_BEARISH';
        }

        return {
          symbol: input.symbol,
          indicator: `MOVING_AVERAGES_${type}`,
          interval: input.interval || '1d',
          current_price: currentPrice,
          moving_averages: movingAverages,
          signals: signals,
          overall_trend: overallTrend,
          analysis: {
            above_ma_count: aboveCount,
            below_ma_count: totalCount - aboveCount,
            trend_strength: (aboveCount / totalCount) * 100,
          },
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },

  {
    name: 'get_support_resistance',
    description: '识别支撑位和阻力位',
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
          default: '1d',
        },
        lookback: {
          type: 'number',
          description: '回看周期，默认20',
          default: 20,
        },
        limit: {
          type: 'number',
          description: '获取K线数量，默认200',
          default: 200,
        },
      },
      required: ['symbol'],
    },
    handler: async (binanceClient: any, args: unknown) => {
      const input = validateInput(GetTechnicalIndicatorSchema, args) as GetSupportResistanceInput;
      validateSymbol(input.symbol);

      try {
        const klines = await binanceClient.candles({
          symbol: input.symbol,
          interval: input.interval || '1d',
          limit: input.limit || 200,
        });

        const highs = klines.map((kline: any) => parseFloat(kline.high));
        const lows = klines.map((kline: any) => parseFloat(kline.low));
        const currentPrice = parseFloat(klines[klines.length - 1].close);
        
        const srData = TechnicalIndicators.findSupportResistance(
          highs,
          lows,
          input.lookback || 20
        );
        
        // 找到最近的支撑位和阻力位
        const nearestSupport = srData.supports.find(s => s < currentPrice) || null;
        const nearestResistance = srData.resistances.find(r => r > currentPrice) || null;
        
        // 计算距离百分比
        const supportDistance = nearestSupport ? 
          ((currentPrice - nearestSupport) / currentPrice) * 100 : null;
        const resistanceDistance = nearestResistance ? 
          ((nearestResistance - currentPrice) / currentPrice) * 100 : null;

        return {
          symbol: input.symbol,
          indicator: 'SUPPORT_RESISTANCE',
          interval: input.interval || '1d',
          current_price: currentPrice,
          nearest_support: nearestSupport,
          nearest_resistance: nearestResistance,
          support_distance_percent: supportDistance,
          resistance_distance_percent: resistanceDistance,
          all_supports: srData.supports.slice(0, 5), // 前5个支撑位
          all_resistances: srData.resistances.slice(0, 5), // 前5个阻力位
          analysis: {
            trend_bias: nearestResistance && nearestSupport ? 
              (resistanceDistance! < supportDistance! ? 'approaching_resistance' : 'near_support') : 'unclear',
            strength: srData.supports.length + srData.resistances.length,
          },
          timestamp: Date.now(),
        };
      } catch (error) {
        handleBinanceError(error);
      }
    },
  },
];