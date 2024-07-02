import { Component, OnInit } from '@angular/core';
import { CurrencyLabel } from './core/enums/currency-label';
import { ExchangeRate } from './core/interfaces/exchange-rate';
import { HttpService } from './core/services/http.service';
import { StoreService } from './core/services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'currency-convert';

  constructor(
    private httpService: HttpService,
    private storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.httpService.getCurrencyData().subscribe((data: ExchangeRate[]) => {
      if (data) {
        this.storeService.exchangePairSubject.next(
          <ExchangeRate>(
            data.find(item => item.baseCurrency === CurrencyLabel.USD)
          )
        );

        this.storeService.exchangePairsList = data;
      }
    });
  }
}
