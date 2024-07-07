import { NgIf } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, forkJoin } from 'rxjs';
import { ConverterComponent } from './components/converter/converter.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { CurrencyLabel } from './core/enums/currency-label';
import { ExchangeRate } from './core/interfaces/exchange-rate';
import { HttpService } from './core/services/http.service';
import { StoreService } from './core/services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    MatToolbar,
    ConverterComponent,
    FooterComponent,
    NgIf
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'currency-convert';
  isDataLoaded = false;

  constructor(
    private httpService: HttpService,
    private storeService: StoreService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'expand',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/expand.svg')
    );
    iconRegistry.addSvgIcon(
      'swap',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/swap.svg')
    );
  }

  ngOnInit(): void {
    forkJoin([
      this.loadImage('eur'),
      this.loadImage('usd'),
      this.httpService.getCurrencyData()
    ]).subscribe({
      next: data => {
        if (data[2]) {
          this.storeService.exchangePairSubject.next(
            <ExchangeRate>(
              data[2].find(item => item.baseCurrency === CurrencyLabel.USD)
            )
          );
          this.storeService.exchangePairsListSubject.next(data[2]);
        }
      },
      complete: () => (this.isDataLoaded = true)
    });
  }

  ngAfterViewInit(): void {
    Object.values(CurrencyLabel).forEach(label => {
      const img = new Image();
      img.src = `assets/flags/${label.toLowerCase()}.png`;
    });
  }

  private loadImage(label: string): Observable<boolean> {
    return new Observable(observer => {
      const img = new Image();
      img.onload = () => {
        observer.next(true);
        observer.complete();
      };
      img.src = `assets/flags/${label}.png`;
    });
  }
}
