import { marketDataTools } from './market-data.js';
import { accountTools } from './account.js';
import { tradingTools } from './trading.js';
import { technicalAnalysisTools } from './technical-analysis.js';

export { marketDataTools, accountTools, tradingTools, technicalAnalysisTools };

export const getAllTools = () => {
  return [
    ...marketDataTools,
    ...accountTools,
    ...tradingTools,
    ...technicalAnalysisTools,
  ];
};