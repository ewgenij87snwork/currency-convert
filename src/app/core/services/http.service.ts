import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
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
        map(response =>
          response.map(item => ({
            baseCurrency: item.CurrencyCodeL,
            targetCurrency: CurrencyLabel.UAH,
            rate: item.Amount
          }))
        ),
        catchError(() => {
          return this.httpClient
            .get<
              ExchangeRateResponse[]
            >('assets/mocks/exchange-rates-mock.json')
            .pipe(
              map(mockData =>
                mockData.map(item => ({
                  baseCurrency: item.CurrencyCodeL,
                  targetCurrency: CurrencyLabel.UAH,
                  rate: item.Amount
                }))
              )
            );
        })
      );
  }
}
