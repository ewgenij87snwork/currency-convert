import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExchangeRate } from '../interfaces/exchange-rate';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  exchangePairSubject: BehaviorSubject<ExchangeRate> =
    new BehaviorSubject<ExchangeRate>({} as ExchangeRate);
  exchangePair$ = this.exchangePairSubject.asObservable();
  exchangePairsList!: ExchangeRate[];

  constructor() {}
}
