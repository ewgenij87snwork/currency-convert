export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
}

export interface ExchangeRateResponse {
  date: string;
  uah: {
    [currencyCode: string]: number;
  };
}
