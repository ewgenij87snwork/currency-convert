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
import { MatButton } from '@angular/material/button';
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
    MatButton
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

  constructor(
    private storeService: StoreService,
    private fb: FormBuilder,
    private destroyRef: DestroyRef
  ) {
    this.converterForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.storeService.exchangePairsList$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if (data && data.length > 0) {
          this.currencyListData = data;
        }
      });
    this.addCurrency(CurrencyLabel.USD, 1);
    this.addCurrency(CurrencyLabel.UAH, 1);
  }

  addCurrency(initialLabel?: CurrencyLabel, initialAmount = 0): void {
    const newCurrency: ControlCurrency = {
      amount: {
        current$: new BehaviorSubject<number>(0),
        amountValue: initialAmount
      },
      label: {
        filteredLabels$: new BehaviorSubject<CurrencyLabel[]>(
          this.currencyLabels
        ),
        selectedLabel: initialLabel || CurrencyLabel.CHF,
        isCurrencyLabelValid: true
      }
    };

    this.currencyControls.push(newCurrency);

    const currencyIndex = this.currencyControls.length - 1;
    const currencyGroup: FormGroup<CurrencyFormGroup> = this.fb.group({
      amount: [newCurrency.amount.amountValue, AmountValidator],
      label: [newCurrency.label.selectedLabel, LabelValidator]
    });

    this.converterForm.addControl(`currency${currencyIndex}`, currencyGroup);

    this.setupControlValidation(currencyGroup);

    newCurrency.amount.current$ = currencyGroup.controls[
      'amount'
    ].valueChanges.pipe(
      distinctUntilChanged(),
      startWith(
        currencyGroup.controls['amount'].value ?? newCurrency.amount.amountValue
      ),
      map(value =>
        typeof value === 'number' ? value : newCurrency.amount.amountValue
      ),
      takeUntilDestroyed(this.destroyRef)
    );

    const labelControl = currencyGroup.controls['label'];
    labelControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.currencyControls[currencyIndex].label.isCurrencyLabelValid =
          !!value && this.currencyLabels.includes(value as CurrencyLabel);
        this.currencyControls[currencyIndex].label.filteredLabels$.next(
          this.getAvailableCurrencies(value as CurrencyLabel)
        );
      });
    this.selectLabel(initialLabel || CurrencyLabel.CHF, currencyIndex);
  }

  selectLabel(label: CurrencyLabel, i: number) {
    const labelControl = this.converterForm.get('currency' + i + '.label');
    if (labelControl && labelControl.valueChanges) {
      labelControl?.setValue(label, { emitEvent: false });
      this.currencyControls[i].label.filteredLabels$.next(this.currencyLabels);
      labelControl?.valueChanges.pipe(
        startWith(''),
        map(labelValue => this.getAvailableCurrencies(labelValue))
      );
    }
  }

  onEnterPress(event: Event, currencyIndex: number) {
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
      event.preventDefault();
      const autocompleteValue =
        this.autocompletes.toArray()[currencyIndex].options.first?.value;

      if (autocompleteValue) {
        this.selectLabel(autocompleteValue, currencyIndex);
        this.currencyControls[currencyIndex].label.isCurrencyLabelValid = true;
        this.autocompleteTriggers.toArray()[currencyIndex].closePanel();
      }
    }
  }

  private getAvailableCurrencies(labelValue: CurrencyLabel): CurrencyLabel[] {
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
}
