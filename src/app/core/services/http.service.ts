import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CurrencyLabel } from '../enums/currency-label';
import {
  ExchangeRate,
  ExchangeRateResponse
} from '../interfaces/exchange-rate';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  constructor(private httpClient: HttpClient) {}

  getCurrencyData(): Observable<ExchangeRate[]> {
    return this.httpClient
      .get<ExchangeRateResponse>(
        'https://latest.currency-api.pages.dev/v1/currencies/uah.json'
      )
      .pipe(
        map(({ uah: uahRates }) => {
          return Object.keys(uahRates).map(currency => ({
            baseCurrency: currency.toUpperCase(),
            targetCurrency: CurrencyLabel.UAH,
            rate: 1 / uahRates[currency]
          }));
        })
      );
  }
}
