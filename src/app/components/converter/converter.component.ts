import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import {
  Component,
  DestroyRef,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption
} from '@angular/material/autocomplete';
import {
  MatButton,
  MatIconButton,
  MatMiniFabButton
} from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { BehaviorSubject, debounceTime, distinctUntilChanged } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CurrencyLabel } from '../../core/enums/currency-label';
import { ControlCurrency } from '../../core/interfaces/control-currency';
import { CurrencyFormGroup } from '../../core/interfaces/currency-form-group';
import { ExchangeRate } from '../../core/interfaces/exchange-rate';
import { CalculatorService } from '../../core/services/calculator.service';
import { StoreService } from '../../core/services/store.service';
import AmountValidator from '../../core/validators/amount-validator';
import LabelValidator from '../../core/validators/label-validator';

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
    MatError,
    MatButton,
    MatIconButton,
    MatMiniFabButton
  ],
  styleUrls: ['./converter.component.scss']
})
export class ConverterComponent implements OnInit {
  @ViewChildren(MatAutocomplete) autocompletes!: QueryList<MatAutocomplete>;
  @ViewChildren(MatAutocompleteTrigger)
  autocompleteTriggers!: QueryList<MatAutocompleteTrigger>;
  currencyControls: ControlCurrency[] = [];
  converterForm: FormGroup;
  currencyLabels = Object.values(CurrencyLabel);
  currencyListData: ExchangeRate[] = [];
  exchangeRates: string[] = [];
  isSwapClicked = [false];

  constructor(
    private storeService: StoreService,
    private fb: FormBuilder,
    private calculatorService: CalculatorService,
    private destroyRef: DestroyRef
  ) {
    this.converterForm = this.fb.group({});
  }

  trackByIndex(index: number) {
    return index;
  }

  ngOnInit(): void {
    this.storeService.exchangePairsList$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if (data && data.length > 0) {
          this.currencyListData = data;
          this.initializeCurrencies();
        }
      });
  }

  initializeCurrencies(): void {
    this.addCurrency(CurrencyLabel.USD, 1);
    this.addCurrency(CurrencyLabel.UAH, 1);
    this.converterForm.get('currency0.amount')?.setValue(1);
    this.calculatorService.convert(
      this.currencyControls,
      0,
      this.currencyListData
    );
  }

  addCurrency(initialLabel?: CurrencyLabel, initialAmount?: number): void {
    if (this.currencyControls.length > 10) return;
    const newCurrency: ControlCurrency = {
      amount: initialAmount || 1,
      label: {
        filteredLabels$: new BehaviorSubject<CurrencyLabel[]>(
          this.currencyLabels
        ),
        selectedLabel: initialLabel || CurrencyLabel.AUD,
        isCurrencyLabelValid: true
      }
    };

    this.currencyControls.push(newCurrency);

    const currencyIndex = this.currencyControls.length - 1;
    const currencyGroup: FormGroup<CurrencyFormGroup> = this.fb.group({
      amount: [newCurrency.amount, AmountValidator],
      label: [
        newCurrency.label.selectedLabel,
        LabelValidator(newCurrency.label.filteredLabels$)
      ]
    });

    this.converterForm.addControl(`currency${currencyIndex}`, currencyGroup);

    currencyGroup.controls['amount'].valueChanges
      .pipe(
        distinctUntilChanged(),
        startWith(currencyGroup.controls['amount'].value ?? newCurrency.amount),
        map(value => {
          !!value && (this.currencyControls[currencyIndex].amount = value);
          if (
            this.currencyListData.length > 0 &&
            this.currencyControls.length > 1
          ) {
            this.currencyControls = this.calculatorService.convert(
              this.currencyControls,
              currencyIndex,
              this.currencyListData
            );
            this.updateExchangeRates();
          }
          this.updateFormValues();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    const labelControl = currencyGroup.controls['label'];
    labelControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        map(label => {
          if (label) {
            this.currencyControls[currencyIndex].label.isCurrencyLabelValid =
              this.currencyLabels.includes(label as CurrencyLabel);
            this.currencyControls[currencyIndex].label.selectedLabel = label;
            this.currencyControls[currencyIndex].label.filteredLabels$.next(
              this.getRelevantCurrencies(label as CurrencyLabel)
            );
          }
          this.currencyControls = this.calculatorService.convert(
            this.currencyControls,
            currencyIndex,
            this.currencyListData
          );
          this.updateExchangeRates();
          this.updateFormValues();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.selectLabel(initialLabel || CurrencyLabel.AUD, currencyIndex);
    this.setupControlValidation(currencyGroup);
  }

  removeCurrency(): void {
    if (this.currencyControls.length > 2) {
      const lastIndex = this.currencyControls.length - 1;

      this.currencyControls.splice(lastIndex, 1);

      this.converterForm.removeControl(`currency${lastIndex}`);

      this.updateExchangeRates();
      this.updateFormValues();
    }
  }

  selectLabel(label: CurrencyLabel, i: number) {
    const labelControl = this.converterForm.get('currency' + i + '.label');
    if (labelControl && labelControl.valueChanges) {
      labelControl?.setValue(label);
      this.currencyControls[i].label.filteredLabels$.next(this.currencyLabels);
      labelControl?.valueChanges.pipe(
        startWith(''),
        map(labelValue => this.getRelevantCurrencies(labelValue))
      );
    }
  }

  onEnterPress(event: Event, currencyIndex: number) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      const autocompleteValue =
        this.autocompletes.toArray()[currencyIndex].options.first?.value;

      if (autocompleteValue) {
        this.selectLabel(autocompleteValue, currencyIndex);
        this.currencyControls[currencyIndex].label.isCurrencyLabelValid = true;
        this.autocompleteTriggers.toArray()[currencyIndex].closePanel();
      }
    }
  }

  swapCurrencies(index: number): void {
    if (index < 0 || index >= this.currencyControls.length - 1) {
      return;
    }

    [this.currencyControls[index], this.currencyControls[index + 1]] = [
      this.currencyControls[index + 1],
      this.currencyControls[index]
    ];

    this.updateExchangeRates();
    this.updateFormValues();
  }

  toggleSwapIcon(index: number): void {
    if (!this.isSwapClicked[index]) {
      this.isSwapClicked[index] = false;
    }
    this.isSwapClicked[index] = !this.isSwapClicked[index];
  }

  private getRelevantCurrencies(labelValue: CurrencyLabel): CurrencyLabel[] {
    return this.currencyLabels.filter(label =>
      label.toLowerCase().includes(labelValue.toLowerCase())
    );
  }

  private setupControlValidation(currencyGroup: FormGroup<CurrencyFormGroup>) {
    Object.keys(currencyGroup.controls).forEach(field => {
      const control = currencyGroup.get(field);
      control?.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(200),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          control?.markAsTouched({ onlySelf: true });
          control?.updateValueAndValidity();
        });
    });
  }

  private updateExchangeRates(): void {
    this.exchangeRates = [];
    for (let i = 0; i < this.currencyControls.length - 1; i++) {
      const fromCurrency = this.currencyControls[i].label.selectedLabel;
      const toCurrency = this.currencyControls[i + 1].label.selectedLabel;
      const rate = this.calculatorService.getRate(
        fromCurrency,
        toCurrency,
        this.currencyListData
      );
      if (!isNaN(rate)) {
        this.exchangeRates.push(
          `1 ${fromCurrency} = ${this.calculatorService.trimToTwoDecimalPlaces(
            rate,
            4
          )} ${toCurrency}`
        );
      } else {
        this.exchangeRates.push(`-`);
      }
    }
  }

  private updateFormValues() {
    this.currencyControls.forEach((currency, index) => {
      const currencyGroup = this.converterForm.get(
        `currency${index}`
      ) as FormGroup;
      if (currencyGroup) {
        const currentAmountValue = currency.amount;
        const currentAmountFormValue = currencyGroup.get('amount')?.value;

        const currentLabelValue = currency.label.selectedLabel;
        const currentLabelFormValue = currencyGroup.get('label')?.value;

        if (
          currentAmountFormValue > 0 &&
          currentAmountFormValue !== currentAmountValue
        ) {
          currencyGroup.controls['amount'].setValue(currentAmountValue, {
            emitEvent: false
          });
        }

        if (
          currentLabelFormValue.length > 0 &&
          currentLabelFormValue !== currentLabelValue
        ) {
          currencyGroup.controls['label'].setValue(currentLabelValue, {
            emitEvent: false
          });
        }
      }
    });
  }
}
