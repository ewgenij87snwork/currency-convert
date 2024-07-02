import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { CurrencyLabel } from '../../core/enums/currency-label';
import { ExchangeRate } from '../../core/interfaces/exchange-rate';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButton, NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  usdUah = {} as ExchangeRate;
  eurUah = {} as ExchangeRate;
  protected readonly CurrencyLabel = CurrencyLabel;

  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    this.storeService.exchangePairsList$.subscribe(data => {
      if (data) {
        this.eurUah = this.findCurrency(CurrencyLabel.EUR, data);
        this.usdUah = this.findCurrency(CurrencyLabel.USD, data);
      }
    });
  }

  findCurrency(currency: CurrencyLabel, data: ExchangeRate[]): ExchangeRate {
    return <ExchangeRate>data.find(item => item.baseCurrency === currency);
  }
}
