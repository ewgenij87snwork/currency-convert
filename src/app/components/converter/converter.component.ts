import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CurrencyLabel } from '../../core/enums/currency-label';
import { ExchangeRate } from '../../core/interfaces/exchange-rate';
import { StoreService } from '../../core/services/store.service';
import AmountValidator from '../../core/validators/amount-validator';
import CurrencyLabelValidator from '../../core/validators/currency-label-validator';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  standalone: true,
  imports: [
    MatIcon,
    MatCard,
    ReactiveFormsModule,
    MatCardHeader,
    MatFormField,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatOption,
    AsyncPipe,
    NgIf,
    NgForOf,
    MatInput,
    MatCardContent,
    MatCardTitle,
    MatError
  ],
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit {
  currencyLabels = Object.values(CurrencyLabel);
  currencyListData: ExchangeRate[] = [];
  selectedExchangeRate: ExchangeRate | undefined;
  converterForm: FormGroup;
  filteredCurrencyLabels$: Observable<string[]> | undefined;
  isCurrencyLabelValid = true;
  @ViewChild(MatAutocomplete) autocomplete!: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger)
  autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(
    private storeService: StoreService,
    private fb: FormBuilder
  ) {
    this.converterForm = this.fb.group({
      firstCurrencyAmount: [0, [AmountValidator]],
      firstCurrencyLabel: [CurrencyLabel.USD, CurrencyLabelValidator],
      secondCurrencyAmount: 0,
      secondCurrencyLabel: CurrencyLabel.UAH
    });
  }

  ngOnInit(): void {
    this.storeService.exchangePairsList$.subscribe(data => {
      if (data && data.length > 0) {
        this.currencyListData = data;
      }
    });

    this.selectCurrency(CurrencyLabel.USD);
    this.checkCurrencyLabelValidity();
    this.setupControlValidation();
  }

  selectCurrency(currencyLabel: string) {
    this.converterForm
      .get('firstCurrencyLabel')
      ?.setValue(currencyLabel, { emitEvent: false });

    this.filteredCurrencyLabels$ = this.converterForm
      .get('firstCurrencyLabel')
      ?.valueChanges.pipe(
        startWith(''),
        map(value => this.getAvailableCurrencies(value))
      );
  }

  onEnterPress(event: Event) {
    if (
      event instanceof KeyboardEvent &&
      event.key === 'Enter' &&
      this.autocomplete.options.length > 0
    ) {
      event.preventDefault();
      if (this.autocomplete.options.first?.value) {
        this.selectCurrency(this.autocomplete.options.first?.value);
        this.isCurrencyLabelValid = true;
      }
      this.autocompleteTrigger.closePanel();
    }
  }

  private getAvailableCurrencies(value: string): string[] {
    return this.currencyLabels.filter(currencyLabel =>
      currencyLabel.toLowerCase().includes(value.toLowerCase())
    );
  }

  private checkCurrencyLabelValidity() {
    this.converterForm.controls['firstCurrencyLabel'].valueChanges.subscribe(
      value => {
        this.isCurrencyLabelValid = this.currencyLabels.includes(value);
      }
    );
  }

  private setupControlValidation() {
    Object.keys(this.converterForm.controls).forEach(field => {
      const control = this.converterForm.get(field);
      control?.valueChanges.subscribe(() => {
        control.markAsTouched({ onlySelf: true });
        control.updateValueAndValidity({ emitEvent: false });
      });
    });
  }
}
