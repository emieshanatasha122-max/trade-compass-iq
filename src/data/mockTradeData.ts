// Re-export from the new data loader for backwards compatibility
export type { TradeRecord } from './tradeDataLoader';
export { COUNTRY_CODE_MAP, ALPHA2_TO_ALPHA3 } from './tradeDataLoader';

// Legacy export - no longer used, data is loaded async via FilterContext
export const tradeData: import('./tradeDataLoader').TradeRecord[] = [];
