export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

export interface ExchangeRateResponse {
  CurrencyCodeL: string;
  Amount: number;
}
