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
      .get<ExchangeRateResponse[]>('/api/exchange?json')
      .pipe(
        map(r =>
          r.map(item => ({
            baseCurrency: item.CurrencyCodeL,
            targetCurrency: CurrencyLabel.UAH,
            rate: item.Amount
          }))
        )
      );
  }
}
